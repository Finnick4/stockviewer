package database

import (
	"database/sql"
	"fmt"
	"strings"
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

	resp, err := db.Exec(`INSERT INTO stocks (Name, latestUpdate) VALUES (?, ?);`, name, currentTimeStamp)
	if err != nil {
		log.Error(err)
		return 0, err
	}

	lastID, err := resp.LastInsertId()

	if err != nil {
		log.Error(err)
		return 0, err
	}

	_, err = db.Exec(`INSERT INTO stockprice (stockid, Price, timestamp) VALUES (?, ?, ?);`, lastID, initPrice, currentTimeStamp)
	if err != nil {
		log.Error(err)
		return 0, err
	}

	log.Debugf("Successfully created stock '%v' (Id=%v) at t=%v with an initial value of %v\n", name, lastID, currentTimeStamp, initPrice)
	return lastID, nil
}

func GetStockPrice(id int64) (float64, error) {
	db, err := sql.Open("sqlite", "./data.db")
	defer db.Close()

	if err != nil {
		log.Error(err)
		return 0, err
	}

	resp := db.QueryRow(`SELECT Price FROM stockprice WHERE stockid=? AND timestamp=(SELECT latestUpdate FROM stocks WHERE Id=?);`, id, id)
	var price float64
	err = resp.Scan(&price)

	if err != nil {
		log.Error(err)
		return 0, err
	}
	return price, nil
}

func GetStockPrices() ([]StockPrice, error) {
	db, err := sql.Open("sqlite", "./data.db")
	defer db.Close()

	log.Debug("Getting all current stock prices")

	if err != nil {
		log.Error(err)
		return nil, err
	}

	rows, err := db.Query(`SELECT stocks.Id, stockprice.Price FROM stocks JOIN stockprice ON stocks.Id = stockprice.stockid AND stockprice.timestamp=stocks.latestUpdate;`)

	if err != nil {
		log.Error(err)
		return nil, err
	}
	defer rows.Close()

	var data []StockPrice

	for rows.Next() {
		var currentData StockPrice
		err = rows.Scan(&currentData.Id, &currentData.Price)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		data = append(data, currentData)
	}
	return data, nil
}

func GetCurrentStocksSnapshot() ([]CurrentStockData, error) {
	db, err := sql.Open("sqlite", "./data.db")
	defer db.Close()

	if err != nil {
		log.Error(err)
		return nil, err
	}

	rows, err := db.Query(`SELECT stocks.Id, stocks.Name, stockprice.Price FROM stocks JOIN stockprice ON stocks.Id = stockprice.stockid AND stockprice.timestamp=stocks.latestUpdate;`)

	if err != nil {
		log.Error(err)
		return nil, err
	}
	defer rows.Close()

	var data []CurrentStockData

	for rows.Next() {
		var currentData CurrentStockData
		err = rows.Scan(&currentData.Id, &currentData.Name, &currentData.Price)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		data = append(data, currentData)
	}
	return data, nil
}

func GetStockIds() ([]int64, error) {
	log.Debug("Getting all stock IDs")

	db, err := sql.Open("sqlite", "./data.db")
	defer db.Close()

	if err != nil {
		log.Error(err)
		return nil, err
	}

	rows, err := db.Query(`SELECT stocks.id from stocks;`)
	if err != nil {
		log.Error(err)
		return nil, err
	}
	defer rows.Close()

	var data []int64

	for rows.Next() {
		var currentData int64
		err = rows.Scan(&currentData)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		data = append(data, currentData)
	}
	return data, nil
}

func GetStockPricesBetween(id int64, timeFirst int64, timeLast int64) ([]StockPriceTime, error) {
	log.Debugf("Getting all prices of stock %v between %v and %v", id, timeFirst, timeLast)

	db, err := sql.Open("sqlite", "./data.db")
	defer db.Close()

	if err != nil {
		log.Error(err)
		return nil, err
	}

	rows, err := db.Query(`SELECT price, timestamp FROM stockprice WHERE timestamp >= ? AND timestamp <= ? AND stockid = ?;`, timeFirst, timeLast, id)
	if err != nil {
		log.Error(err)
		return nil, err
	}
	defer rows.Close()

	var data []StockPriceTime

	for rows.Next() {
		currentData := StockPriceTime{Id: id}
		err = rows.Scan(&currentData.Price, &currentData.Timestamp)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		data = append(data, currentData)
	}
	return data, nil
}

func SetStockPrices(stocks []StockPrice) {
	log.Debug("Setting new stock prices")

	currentTimeStamp := time.Now().Unix()

	placeholders := make([]string, 0, len(stocks))
	vals := make([]interface{}, 0, len(stocks))
	ids := make([]int64, 0, len(stocks))

	for _, elem := range stocks {
		placeholders = append(placeholders, "(?, ?, ?)")
		vals = append(vals, elem.Id, elem.Price, currentTimeStamp)
		ids = append(ids, elem.Id)
	}

	db, err := sql.Open("sqlite", "./data.db")
	defer db.Close()

	if err != nil {
		log.Error(err)
		return
	}
	insertStatement := fmt.Sprintf(`INSERT INTO stockprice (stockid, price, timestamp) VALUES %v;`, strings.Join(placeholders, ","))
	_, err = db.Exec(insertStatement, vals...)

	if err != nil {
		log.Error(err)
		return
	}

	qIds := strings.Trim(strings.Join(strings.Fields(fmt.Sprint(ids)), ","), "[]")
	insertStatement = fmt.Sprintf("UPDATE stocks SET latestUpdate = %v WHERE id IN (%v);", currentTimeStamp, qIds)

	_, err = db.Exec(insertStatement)
	if err != nil {
		log.Error(err)
		return
	}
}
