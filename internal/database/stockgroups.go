package database

import (
	"database/sql"

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
