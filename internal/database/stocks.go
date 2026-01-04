package database

import (
	"fmt"
	"strings"
	"time"

	log "github.com/sirupsen/logrus"
)

// CreateStock creates a new stock with the given name and initial price and returns the ID of the new stock. The newly created stock is active.
func CreateStock(name string, initPrice float64) (int64, error) {
	currentTimeStamp := time.Now()

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

// GetStockPrice returns the current price of a stock of the given ID
func GetStockPrice(id int64) (int64, error) {
	db := getDB()

	resp := db.QueryRow(`SELECT price FROM stockprice WHERE stockid=$1 AND timestamp=(SELECT "latestUpdate" FROM stocks WHERE id=$1);`, id)
	var price int64
	err := resp.Scan(&price)

	if err != nil {
		log.Error(err)
		return 0, err
	}
	return price, nil
}

// GetStockPrices returns all stock IDs and their respective current price
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

// GetCurrentStockInformation queries all stocks for their ID, name and current price
func GetCurrentStockInformation() ([]CurrentStockData, error) {
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

// GetStockPriceHistory gets the price history of a given stock in the given timeframe
func GetStockPriceHistory(id int64, timeframe int64) ([]StockPriceTime, error) {
	log.Debugf("Getting history of stock %v in timeframe %v", id, timeframe)
	var tf Timeframe
	switch timeframe {
	case 1:
		tf = Timeframe{count: 30, bucketWidth: "1 minute"} // 30 minutes
	case 2:
		tf = Timeframe{count: 30, bucketWidth: "2 minutes"} // 1 hour
	case 3:
		tf = Timeframe{count: 30, bucketWidth: "12 minutes"} // 6 hours
	case 4:
		tf = Timeframe{count: 30, bucketWidth: "48 minutes"} // 24 hours
	}
	db := getDB()

	rows, err := db.Query(`SELECT time_bucket($1, timestamp) AS bucket, avg(price) AS price
		FROM stockprice
		WHERE stockid = $2
		GROUP BY bucket
		ORDER BY bucket DESC LIMIT $3;`, tf.bucketWidth, id, tf.count)
	if err != nil {
		log.Error(err)
		return nil, err
	}
	defer rows.Close()

	data := make([]StockPriceTime, 0, tf.count)

	for rows.Next() {
		var ts time.Time
		var avPrice float64

		err = rows.Scan(&ts, &avPrice)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		data = append(data, StockPriceTime{Timestamp: ts, Price: int64(avPrice)})
	}
	return data, nil
}

// GetActiveStockIds returns all IDs of active stocks
func GetActiveStockIds() ([]int64, error) {
	log.Debug("Getting all stock IDs")

	db := getDB()

	rows, err := db.Query(`SELECT stocks.id from stocks WHERE stocks.status = 1;`)
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

// SetStockPrices creates a new price entry at the current time for all provided stocks with the given price. Furthermore, this entry is also set to be the current price.
func SetStockPrices(stocks []StockPrice) {
	log.Debug("Setting new stock prices")

	currentTimeStamp := time.Now()

	placeholders := make([]string, 0, len(stocks))
	vals := make([]interface{}, 0, len(stocks))
	ids := make([]int64, 0, len(stocks))
	count := 1
	for _, elem := range stocks {
		placeholders = append(placeholders, fmt.Sprintf("($%v, $%v, $%v)", count, count+1, count+2))
		count += 3
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
	insertStatement = fmt.Sprintf(`UPDATE stocks SET "latestUpdate" = $1 WHERE id IN (%v);`, qIds)

	_, err = db.Exec(insertStatement, currentTimeStamp)
	if err != nil {
		log.Error(err)
		return
	}
}
