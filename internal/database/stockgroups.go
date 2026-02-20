package database

import (
	"database/sql"
	"strconv"

	log "github.com/sirupsen/logrus"
)

func GetAllStockGroups() ([]StockGroup, error) {
	log.Debug("Getting all stock groups")

	db := getDB()

	rows, err := db.Query(`SELECT id, name from stockgroups;`)
	if err != nil {
		log.Error(err)
		return nil, err
	}
	defer rows.Close()

	var data []StockGroup

	for rows.Next() {
		var currentData StockGroup
		err = rows.Scan(&currentData.ID, &currentData.Name)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		data = append(data, currentData)
	}
	return data, nil
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
	return lastID, nil
}

func AddStockToGroup(groupID int32, stockID int32, adderID string) error {
	log.Debugf("Adding stock %v to group", stockID)
	db := getDB()

	var resp *sql.Row

	if adderID == "" {
		resp = db.QueryRow(`INSERT INTO stockgroupmembers ("groupId", "stockId")  VALUES ($1, $2);`, groupID, stockID)
	} else {
		resp = db.QueryRow(`INSERT INTO stockgroupmembers ("groupId", "stockId", "creatorId")  VALUES ($1, $2, $3);`, groupID, stockID, adderID)
	}

	if resp.Err() != nil {
		log.Error(resp.Err())
		return resp.Err()
	}
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
	query = query[:len(query)-1]
	db := getDB()
	_, err := db.Exec(query, values...)

	if err != nil {
		log.Error(err)
		return err
	}
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
	query = query[:len(query)-1]
	db := getDB()
	_, err := db.Exec(query, values...)

	if err != nil {
		log.Error(err)
		return err
	}
	return nil
}
