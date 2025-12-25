package database

import (
	"database/sql"
	"time"

	log "github.com/sirupsen/logrus"
)

func CreateStock(name string, initPrice float64) (int64, error) {
	currentTimeStamp := time.Now().Unix()

	db, err := sql.Open("sqlite", "./data.db")
	defer db.Close()

	if err != nil {
		log.Error(err)
		return 0, err
	}

	resp, err := db.Exec(`INSERT INTO stocks (name, latestUpdate) VALUES (?, ?);`, name, currentTimeStamp)
	if err != nil {
		log.Error(err)
		return 0, err
	}

	lastID, err := resp.LastInsertId()

	if err != nil {
		log.Error(err)
		return 0, err
	}

	_, err = db.Exec(`INSERT INTO stockprice (stockid, price, timestamp) VALUES (?, ?, ?);`, lastID, initPrice, currentTimeStamp)
	if err != nil {
		log.Error(err)
		return 0, err
	}

	log.Debugf("Successfully created stock '%v' (id=%v) at t=%v with an initial value of %v\n", name, lastID, currentTimeStamp, initPrice)
	return lastID, nil
}

func GetStockPrice(id int64) (float64, error) {
	db, err := sql.Open("sqlite", "./data.db")
	defer db.Close()

	if err != nil {
		log.Error(err)
		return 0, err
	}

	resp := db.QueryRow(`SELECT price FROM stockprice WHERE stockid=? AND timestamp=(SELECT latestUpdate FROM stocks WHERE id=?);`, id, id)
	var price float64
	err = resp.Scan(&price)

	if err != nil {
		log.Error(err)
		return 0, err
	}
	return price, nil
}

func GetCurrentStocksSnapshot() ([]CurrentStockData, error) {
	db, err := sql.Open("sqlite", "./data.db")
	defer db.Close()

	if err != nil {
		log.Error(err)
		return nil, err
	}

	rows, err := db.Query(`SELECT stocks.id, stocks.name, stockprice.price FROM stocks JOIN stockprice ON stocks.id = stockprice.stockid AND stockprice.timestamp=stocks.latestUpdate;`)

	if err != nil {
		log.Error(err)
		return nil, err
	}
	defer rows.Close()

	var data []CurrentStockData

	for rows.Next() {
		var currentData CurrentStockData
		err = rows.Scan(&currentData.ID, &currentData.Name, &currentData.Price)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		data = append(data, currentData)
	}
	return data, nil
}
