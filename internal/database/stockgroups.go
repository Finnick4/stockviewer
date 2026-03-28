package database

import (
	"database/sql"
	"stockviewer/dto"
	"stockviewer/internal/notifiers"
	"strconv"

	log "github.com/sirupsen/logrus"
)

func GetAllStockGroups(userID string) ([]dto.StockGroupOverview, error) {
	log.Debug("Getting all stock groups")

	db := getDB()

	rows, err := db.Query(`	
SELECT stockgroups.name, stockgroups.id, COALESCE(SUM(stockprice.price), 0) AS "totalPrice", COUNT(DISTINCT stockgroupmembers."stockId") AS "totalMembers", COUNT(DISTINCT starredstockgroups."userId") AS stars, MAX(CASE
    WHEN starredstockgroups."userId" = $1 AND stockgroups.id = starredstockgroups."groupId" THEN 1
    ELSE 0 END) AS starred 
FROM stockgroups
    LEFT JOIN stockgroupmembers ON stockgroups.id = stockgroupmembers."groupId"
    LEFT JOIN stocks ON stockgroupmembers."stockId" = stocks.id
    LEFT JOIN stockprice ON stocks."latestUpdate" = stockprice.timestamp AND stocks.id = stockprice.stockid
    LEFT JOIN starredstockgroups ON stockgroups.id = starredstockgroups."groupId"
GROUP BY stockgroups.name, stockgroups.id ORDER BY stockgroups.id;`, userID)
	if err != nil {
		log.Error(err)
		return nil, err
	}

	defer rows.Close()

	var data []dto.StockGroupOverview

	for rows.Next() {
		var currentData dto.StockGroupOverview
		err = rows.Scan(&currentData.Name, &currentData.ID, &currentData.TotalValue, &currentData.MemberCount, &currentData.Stars, &currentData.IsStarred)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		data = append(data, currentData)
	}

	return data, nil
}

func GetDetailedStockGroup(userID string, groupID int32) (dto.DetailedStockGroup, error) {
	log.Debugf("Getting stock group %v", groupID)

	if groupID == -1 {
		return GetStarredStocks(userID)
	}

	db := getDB()

	rows, err := db.Query(`
SELECT stockgroups.name, COALESCE(stockgroups.description, ''), COUNT(starredstockgroups."userId"), MAX(CASE
    WHEN starredstockgroups."userId" = $1 AND stockgroups.id = starredstockgroups."groupId" THEN 1
    ELSE 0 END)
FROM stockgroups
	LEFT JOIN starredstockgroups ON stockgroups.id = starredstockgroups."groupId"
WHERE stockgroups.id = $2
GROUP BY stockgroups.name, stockgroups.description;`, userID, groupID)

	if err != nil {
		log.Error(err)
		return dto.DetailedStockGroup{}, err
	}

	defer rows.Close()

	var name string
	var descr string
	var starred bool
	var stars int32

	for rows.Next() {
		err = rows.Scan(&name, &descr, &stars, &starred)
		if err != nil {
			log.Error(err)
			return dto.DetailedStockGroup{}, err
		}
	}

	err = rows.Close()
	if err != nil {
		return dto.DetailedStockGroup{}, err
	}

	rows, err = db.Query(`	
	SELECT stocks.name, stocks.id, stocks.shorthand, COALESCE(stocks.color, -1), stockprice.price, COUNT(starredstocks."userId"), MAX(CASE
    WHEN starredstocks."userId" = $1 AND stocks.id = starredstocks."stockId" THEN 1
    ELSE 0 END)
	FROM stockgroups
		JOIN stockgroupmembers ON stockgroups.id = stockgroupmembers."groupId"
		JOIN stocks ON stockgroupmembers."stockId" = stocks.id
		JOIN stockprice ON stocks."latestUpdate" = stockprice.timestamp AND stocks.id = stockprice.stockid
		LEFT JOIN starredstocks ON stocks.id = starredstocks."stockId"
	WHERE stockgroups.id = $2 GROUP BY stocks.name, stocks.id, stocks.shorthand, stocks.color, stockprice.price ORDER BY stocks.id;`, userID, groupID)

	if err != nil {
		log.Error(err)
		return dto.DetailedStockGroup{}, err
	}

	var data []dto.DetailedStock

	for rows.Next() {
		var currentData dto.DetailedStock
		err = rows.Scan(&currentData.Name, &currentData.ID, &currentData.Shorthand, &currentData.Color, &currentData.Price, &currentData.Stars, &currentData.IsStarred)
		if err != nil {
			log.Error(err)
			return dto.DetailedStockGroup{}, err
		}
		data = append(data, currentData)
	}

	return dto.DetailedStockGroup{ID: groupID, Name: name, Description: descr, IsStarred: starred, Stars: stars, Members: data}, nil
}

func GetAnonymousStockGroup(stockIDs []int32, userID string) (dto.DetailedStockGroup, error) {
	db := getDB()

	query := `
SELECT stocks.id, stocks.name, stocks.shorthand, COALESCE(stocks.color, -1), stockprice.price, COUNT(starredstocks."userId"), MAX(CASE
    WHEN starredstocks."userId" = $1 AND stocks.id = starredstocks."stockId" THEN 1
    ELSE 0 END) 
FROM stocks
	JOIN stockprice ON stocks."latestUpdate" = stockprice.timestamp AND stocks.id = stockprice.stockid
	LEFT JOIN starredstocks ON stocks.id = starredstocks."stockId"
WHERE id IN (`
	values := []interface{}{}
	values = append(values, userID)

	for i, id := range stockIDs {
		values = append(values, id)

		query += `$` + strconv.Itoa(i+2) + `, `
	}

	query = query[:len(query)-2] + `) GROUP BY stocks.id, stocks.name, stocks.shorthand, stocks.color, stockprice.price ORDER BY stocks.id;`
	rows, err := db.Query(query, values...)

	if err != nil {
		log.Error(err)
		return dto.DetailedStockGroup{}, err
	}

	defer rows.Close()

	var data []dto.DetailedStock

	for rows.Next() {
		var currentData dto.DetailedStock
		err = rows.Scan(&currentData.ID, &currentData.Name, &currentData.Shorthand, &currentData.Color, &currentData.Price, &currentData.Stars, &currentData.IsStarred)
		if err != nil {
			log.Error(err)
			return dto.DetailedStockGroup{}, err
		}
		data = append(data, currentData)
	}

	return dto.DetailedStockGroup{Members: data}, nil
}

func GetAllGroupsWithMemberStockID(stockID int32) ([]dto.StockGroupOverview, error) {
	log.Debugf("Getting all stock groups, %v is in", stockID)
	db := getDB()

	rows, err := db.Query(`
SELECT stockgroups.id, stockgroups.name, SUM(stockprice.price) AS "totalPrice", COUNT(stockgroupmembers."stockId") AS "totalMembers" FROM stockgroups
    JOIN stockgroupmembers ON stockgroups.id = stockgroupmembers."groupId"
    JOIN stocks ON stockgroupmembers."stockId" = stocks.id
    JOIN stockprice ON stocks."latestUpdate" = stockprice.timestamp AND stocks.id = stockprice.stockid
WHERE stockgroups.id IN (
    SELECT stockgroups.id FROM stockgroups
        JOIN stockgroupmembers ON stockgroups.id = stockgroupmembers."groupId"
    WHERE stockgroupmembers."stockId" = $1
                          )
GROUP BY stockgroups.id ORDER BY stockgroups.id;`, stockID)

	if err != nil {
		log.Error(err)
		return nil, err
	}

	defer rows.Close()

	var data []dto.StockGroupOverview

	for rows.Next() {
		var currentData dto.StockGroupOverview
		err = rows.Scan(&currentData.ID, &currentData.Name, &currentData.TotalValue, &currentData.MemberCount)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		data = append(data, currentData)
	}

	return data, nil
}

func GetStarredStockGroups(userID string) ([]dto.StockGroupOverview, error) {
	db := getDB()

	rows, err := db.Query(`	
SELECT stockgroups.name, stockgroups.id, COALESCE(SUM(stockprice.price), 0) AS "totalPrice", COUNT(DISTINCT stockgroupmembers."stockId") AS "totalMembers", COUNT(DISTINCT starredstockgroups."userId") AS stars, true AS starred
FROM stockgroups
    LEFT JOIN stockgroupmembers ON stockgroups.id = stockgroupmembers."groupId"
    LEFT JOIN stocks ON stockgroupmembers."stockId" = stocks.id
    LEFT JOIN stockprice ON stocks."latestUpdate" = stockprice.timestamp AND stocks.id = stockprice.stockid
    LEFT JOIN starredstockgroups ON stockgroups.id = starredstockgroups."groupId"
WHERE starredstockgroups."userId" = $1 AND stockgroups.id = starredstockgroups."groupId"
GROUP BY stockgroups.name, stockgroups.id ORDER BY stockgroups.id;`, userID)
	if err != nil {
		log.Error(err)
		return nil, err
	}

	defer rows.Close()

	var data []dto.StockGroupOverview

	for rows.Next() {
		var currentData dto.StockGroupOverview
		err = rows.Scan(&currentData.Name, &currentData.ID, &currentData.TotalValue, &currentData.MemberCount, &currentData.Stars, &currentData.IsStarred)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		data = append(data, currentData)
	}

	return data, nil
}

func CreateStockGroup(name string, description string, creatorID string) (int32, error) {
	db := getDB()

	var resp *sql.Row

	if creatorID == "" {
		if description == "" {
			resp = db.QueryRow(`INSERT INTO stockgroups (name) VALUES ($1) RETURNING id;`, name)
		} else {
			resp = db.QueryRow(`INSERT INTO stockgroups (name, description) VALUES ($1, $2) RETURNING id;`, name, description)
		}
	} else {
		if description == "" {
			resp = db.QueryRow(`INSERT INTO stockgroups (name, "creatorId") VALUES ($1, $2) RETURNING id;`, name, creatorID)
		} else {
			resp = db.QueryRow(`INSERT INTO stockgroups (name, description, "creatorId") VALUES ($1, $2, $3) RETURNING id;`, name, description, creatorID)
		}
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

func SetStockGroupDescription(id int32, description string) error {
	db := getDB()

	_, err := db.Exec(`UPDATE stockgroups SET description=$1 WHERE id=$2`, description, id)

	if err != nil {
		log.Error(err)
		return err
	}
	notifiers.NotifyStockGroupChange()
	return nil
}

func StarStockGroupID(groupID int32, userID string) error {
	db := getDB()

	_, err := db.Exec(`INSERT INTO starredstockgroups ("groupId", "userId") VALUES ($1, $2) ON CONFLICT DO NOTHING;`, groupID, userID)

	if err != nil {
		log.Error(err)
		return err
	}
	return nil
}

func UnstarStockGroupID(groupID int32, userID string) error {
	db := getDB()

	_, err := db.Exec(`DELETE FROM starredstockgroups WHERE "groupId" = $1 AND "userId" = $2;`, groupID, userID)

	if err != nil {
		log.Error(err)
		return err
	}
	return nil
}

func IsValidGroupID(groupID int32) bool {
	db := getDB()

	row := db.QueryRow(`SELECT EXISTS(SELECT 1 FROM stockgroups WHERE id = $1);`, groupID)

	if row.Err() != nil {
		return false
	}
	exists := false
	err := row.Scan(&exists)
	if err != nil {
		return false
	}
	return exists
}
