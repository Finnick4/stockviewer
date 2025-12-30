package database

import (
	"fmt"
	"strings"
	"time"

	log "github.com/sirupsen/logrus"
)

func CreateStock(name string, initPrice float64) (int64, error) {
	currentTimeStamp := time.Now().Unix()

	db := getDB()

	resp := db.QueryRow(`INSERT INTO stocks (name, "latestUpdate") VALUES ($1, $2) RETURNING id;`, name, currentTimeStamp)

	if resp.Err() != nil {
		log.Error(resp.Err())
		return 0, resp.Err()
	}
	var lastID int64
	err := resp.Scan(&lastID)

	if err != nil {
		log.Error(err)
		return 0, err
	}

	_, err = db.Exec(`INSERT INTO stockprice (stockid, price, timestamp) VALUES ($1, $2, $3);`, lastID, initPrice, currentTimeStamp)
	if err != nil {
		log.Error(err)
		return 0, err
	}

	log.Debugf("Successfully created stock '%v' (Id=%v) at t=%v with an initial value of %v\n", name, lastID, currentTimeStamp, initPrice)
	return lastID, nil
}

func GetStockPrice(id int64) (float64, error) {
	db := getDB()

	resp := db.QueryRow(`SELECT price FROM stockprice WHERE stockid=$1 AND timestamp=(SELECT "latestUpdate" FROM stocks WHERE id=$1);`, id)
	var price float64
	err := resp.Scan(&price)

	if err != nil {
		log.Error(err)
		return 0, err
	}
	return price, nil
}

func GetStockPrices() ([]StockPrice, error) {
	db := getDB()

	log.Debug("Getting all current stock prices")
	rows, err := db.Query(`SELECT "stocks".id, stockprice.price FROM stocks JOIN stockprice ON stocks.id = stockprice.stockid AND stockprice.timestamp=stocks."latestUpdate";`)

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
	db := getDB()

	rows, err := db.Query(`SELECT stocks.id, stocks.name, stockprice.price FROM stocks JOIN stockprice ON stocks.id = stockprice.stockid AND stockprice.timestamp=stocks."latestUpdate";`)

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

	db := getDB()

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

	db := getDB()

	rows, err := db.Query(`SELECT price, timestamp FROM stockprice WHERE timestamp >= $1 AND timestamp <= $2 AND stockid = $3;`, timeFirst, timeLast, id)
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

	db := getDB()

	insertStatement := fmt.Sprintf(`INSERT INTO stockprice (stockid, price, timestamp) VALUES %v;`, strings.Join(placeholders, ","))
	_, err := db.Exec(insertStatement, vals...)

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
