package database

import (
	"database/sql"
	"fmt"
	"stockviewer/internal/notifiers"
	"strings"
	"time"

	log "github.com/sirupsen/logrus"
)

// CreateStock creates a new stock with the given name and initial price and returns the ID of the new stock. The newly created stock is active.
func CreateStock(name string, initPrice int64, creatorID string) (int32, error) {
	currentTimeStamp := time.Now()

	db := getDB()

	var resp *sql.Row

	if creatorID == "" {
		resp = db.QueryRow(`INSERT INTO stocks (name, "latestUpdate") VALUES ($1, $2) RETURNING id;`, name, currentTimeStamp)
	} else {
		resp = db.QueryRow(`INSERT INTO stocks (name, "latestUpdate", "creatorId") VALUES ($1, $2, $3) RETURNING id;`, name, currentTimeStamp, creatorID)
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

	_, err = db.Exec(`INSERT INTO stockprice (stockid, price, timestamp) VALUES ($1, $2, $3);`, lastID, initPrice, currentTimeStamp)
	if err != nil {
		log.Error(err)
		return 0, err
	}

	go notifiers.NotifyStockChange()
	log.Debugf("Successfully created stock '%v' (ID=%v) at t=%v with an initial value of %v\n", name, lastID, currentTimeStamp, initPrice)
	return lastID, nil
}

// GetStockInfo returns the current name and price of a stock of the given ID
func GetStockInfo(id int32) (CurrentStockData, error) {
	db := getDB()

	resp := db.QueryRow(`SELECT stocks.name, stockprice.price FROM stocks JOIN stockprice ON stocks."latestUpdate"=stockprice.timestamp AND stocks.id=stockprice.stockid WHERE stocks.id=$1;`, id)
	var data CurrentStockData
	err := resp.Scan(&data.Name, &data.Price)
	data.ID = id

	if err != nil {
		log.Error(err)
		return CurrentStockData{}, err
	}
	return data, nil
}

// GetStockPrices returns all stock IDs and their respective current price
func GetStockPrices() ([]StockPrice, error) {
	db := getDB()

	log.Debug("Getting all current stock prices")
	rows, err := db.Query(`SELECT "stocks".id, stockprice.price FROM stocks JOIN stockprice ON stocks.id = stockprice.stockid AND stockprice.timestamp=stocks."latestUpdate" WHERE stocks.status = 1;`)

	if err != nil {
		log.Error(err)
		return nil, err
	}
	defer rows.Close()

	var data []StockPrice

	for rows.Next() {
		var currentData StockPrice
		err = rows.Scan(&currentData.ID, &currentData.Price)
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

	rows, err := db.Query(`SELECT stocks.id, stocks.name, stockprice.price FROM stocks JOIN stockprice ON stocks.id = stockprice.stockid AND stockprice.timestamp=stocks."latestUpdate" ORDER BY stocks.id;`)

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

// GetStockPriceHistory gets the price history of a given stock in the given timeframe
func GetStockPriceHistory(id int32, timeframe Timeframe) ([]StockPriceTime, error) {
	log.Debugf("Getting history of stock %v in timeframe %v", id, timeframe)

	db := getDB()

	rows, err := db.Query(`SELECT time_bucket($1, timestamp) AS bucket, avg(price) AS price
		FROM stockprice
		WHERE stockid = $2
		GROUP BY bucket
		ORDER BY bucket DESC LIMIT $3;`, timeframe.bucketWidth, id, timeframe.count)
	if err != nil {
		log.Error(err)
		return nil, err
	}
	defer rows.Close()

	data := make([]StockPriceTime, 0, timeframe.count)

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
func GetActiveStockIds() ([]int32, error) {
	log.Debug("Getting all stock IDs")

	db := getDB()

	rows, err := db.Query(`SELECT stocks.id from stocks WHERE stocks.status = 1;`)
	if err != nil {
		log.Error(err)
		return nil, err
	}
	defer rows.Close()

	var data []int32

	for rows.Next() {
		var currentData int32
		err = rows.Scan(&currentData)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		data = append(data, currentData)
	}
	return data, nil
}

func GetStocksPriceDelta() ([]PriceDelta, error) {
	log.Debug("Getting all stocks deltas")

	db := getDB()

	rows, err := db.Query(`SELECT id, name, d.avrg FROM stocks JOIN LATERAL (SELECT time_bucket('1 minute', timestamp) AS bucket, avg(price) AS avrg
		FROM stockprice sp
		WHERE stocks.id = stockid
		GROUP BY bucket
		ORDER BY bucket DESC LIMIT 2) d ON true
		ORDER BY id;`)
	if err != nil {
		log.Error(err)
		return nil, err
	}
	defer rows.Close()
	// new - old - new - old
	var data []PriceDelta
	var i = 1
	var currentData PriceDelta
	var currentID int64

	for rows.Next() {
		var price float64
		err = rows.Scan(&currentData.ID, &currentData.Name, &price)

		if err != nil {
			log.Error(err)
			return nil, err
		}

		if i == 2 {
			if currentID != currentData.ID {
				newID := currentData.ID

				currentData.Price1 = 0

				currentData.DeltaAmount = currentData.Price2 - currentData.Price1
				currentData.DeltaPercent = (float64(currentData.Price2) / float64(currentData.Price1)) - 1.0
				currentData.ID = currentID
				data = append(data, currentData)

				currentData.ID = newID
				currentData.Price2 = int64(price)
				i = 1
				continue
			}
			currentData.Price1 = int64(price)

			currentData.DeltaAmount = currentData.Price2 - currentData.Price1
			currentData.DeltaPercent = (float64(currentData.Price2) / float64(currentData.Price1)) - 1.0
			data = append(data, currentData)
			i = 1
		} else {
			currentID = currentData.ID
			currentData.Price2 = int64(price)
			i++
		}
	}
	return data, nil
}

func SetStockName(id int32, name string) error {
	db := getDB()

	_, err := db.Exec(`UPDATE stocks SET name=$1 WHERE id=$2`, name, id)

	if err != nil {
		log.Error(err)
		return err
	}
	go notifiers.NotifyStockChange()
	return nil
}

func SetStockPrice(id int32, price int64) error {
	db := getDB()

	currentTimeStamp := time.Now()

	_, err := db.Exec(`INSERT INTO stockprice (stockid, price, timestamp) VALUES ($1, $2, $3);`, id, price, currentTimeStamp)
	if err != nil {
		log.Error(err)
		return err
	}

	_, err = db.Exec(`UPDATE stocks SET "latestUpdate"=$1 WHERE id=$2`, currentTimeStamp, id)

	if err != nil {
		log.Error(err)
		return err
	}
	go notifiers.NotifyStockChange()
	return nil
}

func UpdateCompleteStock(stock CurrentStockData) error {
	db := getDB()

	currentTimeStamp := time.Now()

	_, err := db.Exec(`INSERT INTO stockprice (stockid, price, timestamp) VALUES ($1, $2, $3);`, stock.ID, stock.Price, currentTimeStamp)
	if err != nil {
		log.Error(err)
		return err
	}

	_, err = db.Exec(`UPDATE stocks SET "latestUpdate"=$1, name=$2 WHERE id=$3`, currentTimeStamp, stock.Name, stock.ID)

	if err != nil {
		log.Error(err)
		return err
	}
	go notifiers.NotifyStockChange()
	return nil
}

// SetStockPrices creates a new price entry at the current time for all provided stocks with the given price. Furthermore, this entry is also set to be the current price.
func SetStockPrices(stocks []StockPrice) {
	log.Debug("Setting new stock prices")

	currentTimeStamp := time.Now()

	placeholders := make([]string, 0, len(stocks))
	vals := make([]interface{}, 0, len(stocks))
	ids := make([]int32, 0, len(stocks))
	count := 1
	for _, elem := range stocks {
		placeholders = append(placeholders, fmt.Sprintf("($%v, $%v, $%v)", count, count+1, count+2))
		count += 3
		vals = append(vals, elem.ID, elem.Price, currentTimeStamp)
		ids = append(ids, elem.ID)
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
	go notifiers.NotifyStockChange()
}
