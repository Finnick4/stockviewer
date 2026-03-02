package database

import (
	"database/sql"
	"errors"
	"stockviewer/internal/notifiers"
	"strconv"

	log "github.com/sirupsen/logrus"
)

func GetAllStockGroups() ([]StockGroup, error) {
	log.Debug("Getting all stock groups")

	db := getDB()

	rowsName, err := db.Query(`	SELECT stockgroups.name, stockgroups.id FROM stockgroups ORDER BY stockgroups.id;`)
	if err != nil {
		log.Error(err)
		return nil, err
	}

	defer rowsName.Close()

	rowsMembers, err := db.Query(`	SELECT stockgroups.id, SUM(stockprice.price) AS "totalPrice", COUNT(stockgroupmembers."stockId") AS "totalMembers" FROM stockgroups
										JOIN stockgroupmembers ON stockgroups.id = stockgroupmembers."groupId"
										JOIN stocks ON stockgroupmembers."stockId" = stocks.id
										JOIN stockprice ON stocks."latestUpdate" = stockprice.timestamp AND stocks.id = stockprice.stockid
									GROUP BY stockgroups.id ORDER BY stockgroups.id;`)
	if err != nil {
		log.Error(err)
		return nil, err
	}

	defer rowsMembers.Close()

	var data []StockGroup

	for rowsName.Next() {
		var currentData StockGroup
		err = rowsName.Scan(&currentData.Name, &currentData.ID)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		data = append(data, currentData)
	}

	for rowsMembers.Next() {
		var id int32
		var count int32
		var totalValue int64

		err = rowsMembers.Scan(&id, &totalValue, &count)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		for i, stockGroup := range data {
			if id == stockGroup.ID {
				data[i].MemberCount = count
				data[i].TotalValue = totalValue
			}
		}
	}
	return data, nil
}

func GetDetailedStockGroup(groupID int32) (DetailedStockGroup, error) {
	log.Debugf("Getting stock group %v", groupID)
	db := getDB()

	row := db.QueryRow(`SELECT stockgroups.name FROM stockgroups WHERE stockgroups.id = $1`, groupID)

	var name string
	if row.Err() != nil {
		log.Error(row.Err())
		return DetailedStockGroup{}, row.Err()
	}
	err := row.Scan(&name)

	if err != nil {
		if errors.Is(sql.ErrNoRows, err) {
			return DetailedStockGroup{}, nil
		}
		log.Error(err)
		return DetailedStockGroup{}, err
	}

	rows, err := db.Query(`	SELECT stocks.name, stocks.id, stockprice.price FROM stockgroups
										JOIN stockgroupmembers ON stockgroups.id = stockgroupmembers."groupId"
										JOIN stocks ON stockgroupmembers."stockId" = stocks.id
										JOIN stockprice ON stocks."latestUpdate" = stockprice.timestamp AND stocks.id = stockprice.stockid
									WHERE stockgroups.id = $1 ORDER BY stocks.id;`, groupID)

	if err != nil {
		log.Error(err)
		return DetailedStockGroup{}, err
	}

	defer rows.Close()

	var data []CurrentStockData

	for rows.Next() {
		var currentData CurrentStockData
		err = rows.Scan(&currentData.Name, &currentData.ID, &currentData.Price)
		if err != nil {
			log.Error(err)
			return DetailedStockGroup{}, err
		}
		data = append(data, currentData)
	}

	return DetailedStockGroup{ID: groupID, Name: name, Members: data}, nil
}

func GetAnonymousStockGroup(stockIDs []int32) (DetailedStockGroup, error) {
	db := getDB()

	query := `SELECT stocks.id, stocks.name, stockprice.price FROM stocks
				JOIN stockprice ON stocks."latestUpdate" = stockprice.timestamp AND stocks.id = stockprice.stockid
				WHERE id IN (`
	values := []interface{}{}
	for i, id := range stockIDs {
		values = append(values, id)

		query += `$` + strconv.Itoa(i+1) + `, `
	}

	query = query[:len(query)-2] + `) ORDER BY stocks.id;`
	rows, err := db.Query(query, values...)

	if err != nil {
		log.Error(err)
		return DetailedStockGroup{}, err
	}

	defer rows.Close()

	var data []CurrentStockData

	for rows.Next() {
		var currentData CurrentStockData
		err = rows.Scan(&currentData.ID, &currentData.Name, &currentData.Price)
		if err != nil {
			log.Error(err)
			return DetailedStockGroup{}, err
		}
		data = append(data, currentData)
	}

	return DetailedStockGroup{Members: data}, nil
}

func CreateStockGroup(name string, creatorID string) (int32, error) {
	db := getDB()

	var resp *sql.Row

	if creatorID == "" {
		resp = db.QueryRow(`INSERT INTO stockgroups (name) VALUES ($1) RETURNING id;`, name)
	} else {
		resp = db.QueryRow(`INSERT INTO stockgroups (name, "creatorId") VALUES ($1, $2) RETURNING id;`, name, creatorID)
	}

	if resp.Err() != nil {
		log.Error(resp.Err())
		return 0, resp.Err()
	}
	var lastID int32
	err := resp.Scan(&lastID)

	if err != nil {
		log.Error(err)
		return 0, err
	}
	notifiers.NotifyStockGroupChange()
	return lastID, nil
}

func RemoveStockFromGroup(groupID int32, stockID int32) error {
	log.Debugf("Removing stock %v from group", stockID)
	db := getDB()

	_, err := db.Exec(`DELETE FROM stockgroupmembers WHERE "groupId" = $1 AND "stockId" = $2;`, groupID, stockID)

	if err != nil {
		log.Error(err)
		return err
	}
	notifiers.NotifyStockGroupChange()
	return nil
}

func RemoveStocksFromGroup(groupID int32, stockIDs []int32) error {
	log.Debugf("Removing stocks %v to group", stockIDs)

	query := `DELETE FROM stockgroupmembers WHERE "groupId" = $1 AND "stockId" IN (`
	values := []interface{}{}
	values = append(values, groupID)
	for i, s := range stockIDs {
		values = append(values, s)

		query += `$` + strconv.Itoa(i+2) + `, `
	}
	query = query[:len(query)-2] + ");"
	db := getDB()
	_, err := db.Exec(query, values...)

	if err != nil {
		log.Error(err)
		return err
	}
	notifiers.NotifyStockGroupChange()
	return nil
}

func AddStockToGroup(groupID int32, stockID int32, adderID string) error {
	log.Debugf("Adding stock %v to group", stockID)
	db := getDB()

	var resp *sql.Row

	if adderID == "" {
		resp = db.QueryRow(`INSERT INTO stockgroupmembers ("groupId", "stockId") VALUES ($1, $2) ON CONFLICT DO NOTHING;`, groupID, stockID)
	} else {
		resp = db.QueryRow(`INSERT INTO stockgroupmembers ("groupId", "stockId", "creatorId")  VALUES ($1, $2, $3) ON CONFLICT DO NOTHING;`, groupID, stockID, adderID)
	}

	if resp.Err() != nil {
		log.Error(resp.Err())
		return resp.Err()
	}
	notifiers.NotifyStockGroupChange()
	return nil
}

func AddStocksToGroup(groupID int32, stockIDs []int32, adderID string) error {
	log.Debugf("Adding stocks %v to group", stockIDs)

	var err error

	if adderID == "" {
		err = bulkAddStocksToGroupWithoutAdder(groupID, stockIDs)
	} else {
		err = bulkAddStocksToGroupWithAdder(groupID, stockIDs, adderID)
	}
	// As the called functions already notify a change,
	// there is no notifiers.NotifyStockGroupChange()
	// needed at this location!
	return err
}

func bulkAddStocksToGroupWithoutAdder(groupID int32, stockIDs []int32) error {
	query := `INSERT INTO stockgroupmembers ("groupId", "stockId")  VALUES `
	values := []interface{}{}
	for i, s := range stockIDs {
		values = append(values, groupID, s)

		vals := 2
		n := i * vals
		query += `(`

		for j := 0; j < vals; j++ {
			query += `$` + strconv.Itoa(n+j+1) + `, `
		}
		query = query[:len(query)-2] + `),`
	}
	query = query[:len(query)-1] + " ON CONFLICT DO NOTHING;"
	db := getDB()
	_, err := db.Exec(query, values...)

	if err != nil {
		log.Error(err)
		return err
	}
	notifiers.NotifyStockGroupChange()
	return nil
}

func bulkAddStocksToGroupWithAdder(groupID int32, stockIDs []int32, adderID string) error {
	query := `INSERT INTO stockgroupmembers ("groupId", "stockId", "creatorId")  VALUES `
	values := []interface{}{}
	for i, s := range stockIDs {
		values = append(values, groupID, s, adderID)

		vals := 3
		n := i * vals
		query += `(`

		for j := 0; j < vals; j++ {
			query += `$` + strconv.Itoa(n+j+1) + `, `
		}
		query = query[:len(query)-2] + `),`
	}
	query = query[:len(query)-1] + " ON CONFLICT DO NOTHING;"
	db := getDB()
	_, err := db.Exec(query, values...)

	if err != nil {
		log.Error(err)
		return err
	}
	notifiers.NotifyStockGroupChange()
	return nil
}

func SetStockGroupName(id int32, name string) error {
	db := getDB()

	_, err := db.Exec(`UPDATE stockgroups SET name=$1 WHERE id=$2`, name, id)

	if err != nil {
		log.Error(err)
		return err
	}
	notifiers.NotifyStockGroupChange()
	return nil
}
