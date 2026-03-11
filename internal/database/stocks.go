package database

import (
	"database/sql"
	"errors"
	"stockviewer/dto"
	"stockviewer/internal/notifiers"
	"strconv"
	"strings"
	"time"

	log "github.com/sirupsen/logrus"
)

// CreateStock creates a new stock with the given name and initial price and returns the ID of the new stock. The newly created stock is active.
func CreateStock(name string, shorthand string, initPrice int64, creatorID string) (int32, error) {
	currentTimeStamp := time.Now()
	shorthandlowered := strings.ToLower(shorthand)

	db := getDB()

	var resp *sql.Row

	if creatorID == "" {
		resp = db.QueryRow(`INSERT INTO stocks (name, shorthand, "latestUpdate") VALUES ($1, $2, $3) RETURNING id;`, name, shorthandlowered, currentTimeStamp)
	} else {
		resp = db.QueryRow(`INSERT INTO stocks (name, shorthand, "latestUpdate", "creatorId") VALUES ($1, $2, $3, $4) RETURNING id;`, name, shorthandlowered, currentTimeStamp, creatorID)
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
func GetStockInfo(id int32, userID string) (dto.DetailedStock, error) {
	db := getDB()

	resp := db.QueryRow(`
	SELECT stocks.name, stocks.shorthand, COALESCE(stocks.color, -1), stockprice.price, COUNT(starredstocks."userId"), MAX(CASE
    WHEN starredstocks."userId" = $1 THEN 1
    ELSE 0 END)
FROM stocks
         JOIN stockprice ON stocks."latestUpdate"=stockprice.timestamp AND stocks.id=stockprice.stockid
         LEFT JOIN starredstocks ON stocks.id = starredstocks."stockId" AND stocks.id=starredstocks."stockId"
WHERE stocks.id=$2 GROUP BY stocks.name, stocks.shorthand, stocks.color, stockprice.price;`, userID, id)
	var data dto.DetailedStock
	var isStarred int32
	err := resp.Scan(&data.Name, &data.Shorthand, &data.Color, &data.Price, &data.Stars, &isStarred)
	data.ID = id
	data.IsStarred = isStarred == 1

	if err != nil {
		log.Error(err)
		return dto.DetailedStock{}, err
	}
	return data, nil
}

// GetStockPrices returns all stock IDs and their respective current price
func GetStockPrices() ([]dto.StockPrice, error) {
	db := getDB()

	log.Debug("Getting all current stock prices")
	rows, err := db.Query(`SELECT "stocks".id, stockprice.price FROM stocks JOIN stockprice ON stocks.id = stockprice.stockid AND stockprice.timestamp=stocks."latestUpdate" WHERE stocks.status = 1;`)

	if err != nil {
		log.Error(err)
		return nil, err
	}
	defer rows.Close()

	var data []dto.StockPrice

	for rows.Next() {
		var currentData dto.StockPrice
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
func GetCurrentStockInformation(userID string) ([]dto.DetailedStock, error) {
	db := getDB()

	rows, err := db.Query(`
SELECT stocks.id, stocks.name, stocks.shorthand, COALESCE(stocks.color, -1), stockprice.price, COUNT(starredstocks."userId"), MAX(CASE
    WHEN starredstocks."userId" = $1 AND stocks.id = starredstocks."stockId" THEN 1
    ELSE 0 END)
FROM stocks
    JOIN stockprice ON stocks.id = stockprice.stockid AND stockprice.timestamp=stocks."latestUpdate"
    LEFT JOIN starredstocks ON stocks.id = starredstocks."stockId" AND stocks.id=starredstocks."stockId"
GROUP BY stocks.id, stocks.name, stocks.shorthand, stocks.color, stockprice.price ORDER BY stocks.id;`, userID)

	if err != nil {
		log.Error(err)
		return nil, err
	}
	defer rows.Close()

	var data []dto.DetailedStock

	for rows.Next() {
		var currentData dto.DetailedStock
		var isStarred int32
		err = rows.Scan(&currentData.ID, &currentData.Name, &currentData.Shorthand, &currentData.Color, &currentData.Price, &currentData.Stars, &isStarred)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		currentData.IsStarred = isStarred == 1
		data = append(data, currentData)
	}
	return data, nil
}

// GetStockPriceHistory gets the price history of a given stock in the given timeframe
func GetStockPriceHistory(id int32, timeframe dto.Timeframe) ([]dto.StockPriceTime, error) {
	log.Debugf("Getting history of stock %v in timeframe %v", id, timeframe)
	switch timeframe.TotalWidth() {
	case "AllTime":
		return getAllTimeStockPriceHistory(id)
	default:
		return getDynamicStockPriceHistory(id, timeframe)
	}
}

func getDynamicStockPriceHistory(id int32, timeframe dto.Timeframe) ([]dto.StockPriceTime, error) {
	db := getDB()

	rows, err := db.Query(`SELECT time_bucket($1, timestamp) AS bucket, avg(price) AS price
		FROM stockprice
		WHERE stockid = $2
		GROUP BY bucket
		ORDER BY bucket DESC LIMIT $3;`, timeframe.BucketWidth(), id, timeframe.Count())
	if err != nil {
		log.Error(err)
		return nil, err
	}
	defer rows.Close()

	data := make([]dto.StockPriceTime, 0, timeframe.Count())

	for rows.Next() {
		var ts time.Time
		var avPrice float64

		err = rows.Scan(&ts, &avPrice)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		data = append(data, dto.StockPriceTime{Timestamp: ts, Price: int64(avPrice)})
	}
	return data, nil
}
func getAllTimeStockPriceHistory(id int32) ([]dto.StockPriceTime, error) {
	db := getDB()

	rows, err := db.Query(`SELECT time_bucket(((SELECT timestamp FROM stockprice WHERE stockid = $1 ORDER BY timestamp DESC LIMIT 1) - (SELECT timestamp FROM stockprice WHERE stockid = $1 ORDER BY timestamp ASC LIMIT 1)) / 30, timestamp) AS bucket, avg(price) AS price
		FROM stockprice
		WHERE stockid = $1
		GROUP BY bucket
		ORDER BY bucket DESC LIMIT 30;`, id)
	if err != nil {
		log.Error(err)
		return nil, err
	}
	defer rows.Close()

	data := make([]dto.StockPriceTime, 0, 30)

	for rows.Next() {
		var ts time.Time
		var avPrice float64

		err = rows.Scan(&ts, &avPrice)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		data = append(data, dto.StockPriceTime{Timestamp: ts, Price: int64(avPrice)})
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

func GetStocksPriceDelta(tf dto.Timeframe) ([]dto.PriceDelta, error) {
	if tf.TotalWidth() == "AllTime" {
		tf = dto.GenerateTimeframe(1)
	}
	log.Debugf("Getting all stocks deltas in timeframe %v", tf)

	db := getDB()

	rows, err := db.Query(`SELECT id, name, shorthand, COALESCE(color, -1), d.avrg FROM stocks JOIN LATERAL (SELECT time_bucket($1, timestamp) AS bucket, avg(price) AS avrg
		FROM stockprice sp
		WHERE stocks.id = stockid
		GROUP BY bucket
		ORDER BY bucket DESC LIMIT 2) d ON true
		ORDER BY id;`, tf.TotalWidth())
	if err != nil {
		log.Error(err)
		return nil, err
	}
	defer rows.Close()
	// new - old - new - old
	var data []dto.PriceDelta
	var i = 1
	var currentData dto.PriceDelta
	var currentID int64

	for rows.Next() {
		var price float64
		err = rows.Scan(&currentData.ID, &currentData.Name, &currentData.Shorthand, &currentData.Color, &price)

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

func GetStarredStocks(userID string) (dto.DetailedStockGroup, error) {
	db := getDB()

	rows, err := db.Query(`	
	SELECT stocks.name, stocks.id, stocks.shorthand, COALESCE(stocks.color, -1), stockprice.price, (SELECT COUNT("userId") FROM starredstocks WHERE starredstocks."stockId" = stocks.id) AS count FROM stocks
		JOIN starredstocks ON stocks.id = starredstocks."stockId"
		JOIN stockprice ON stocks."latestUpdate" = stockprice.timestamp AND stocks.id = stockprice.stockid
	WHERE starredstocks."userId" = $1 GROUP BY stocks.name, stocks.id, stocks.shorthand, stocks.color, stockprice.price ORDER BY stocks.id;`, userID)

	defer rows.Close()

	if err != nil {
		log.Error(err)
		return dto.DetailedStockGroup{}, err
	}

	var data []dto.DetailedStock

	for rows.Next() {
		var currentData dto.DetailedStock
		err = rows.Scan(&currentData.Name, &currentData.ID, &currentData.Shorthand, &currentData.Color, &currentData.Price, &currentData.Stars)
		if err != nil {
			log.Error(err)
			return dto.DetailedStockGroup{}, err
		}
		currentData.IsStarred = true
		data = append(data, currentData)
	}

	return dto.DetailedStockGroup{ID: -1, Name: "Starred Stocks", Description: "All stocks that you have starred!", Members: data}, nil
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

func SetStockShorthand(id int32, shorthand string) error {
	log.Debugf("Trying to set shorthand of stock %v to %v", id, shorthand)
	db := getDB()

	_, err := db.Exec(`UPDATE stocks SET shorthand=$1 WHERE id=$2`, shorthand, id)

	if err != nil {
		log.Error(err)
		return err
	}
	go notifiers.NotifyStockChange()
	return nil
}

func SetStockNameAndShorthand(id int32, name string, shorthand string) error {
	db := getDB()

	_, err := db.Exec(`UPDATE stocks SET name=$1, shorthand=$2 WHERE id=$3`, name, shorthand, id)

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

func UpdateCompleteStock(stock dto.DetailedStock) error {
	db := getDB()

	currentTimeStamp := time.Now()

	_, err := db.Exec(`INSERT INTO stockprice (stockid, price, timestamp) VALUES ($1, $2, $3);`, stock.ID, stock.Price, currentTimeStamp)
	if err != nil {
		log.Error(err)
		return err
	}

	if stock.Color < 0 {
		_, err = db.Exec(`UPDATE stocks SET "latestUpdate"=$1, name=$2, color=null WHERE id=$3`, currentTimeStamp, stock.Name, stock.ID)
	} else {
		_, err = db.Exec(`UPDATE stocks SET "latestUpdate"=$1, name=$2, color=$3 WHERE id=$4`, currentTimeStamp, stock.Name, stock.Color, stock.ID)
	}

	if err != nil {
		log.Error(err)
		return err
	}
	go notifiers.NotifyStockChange()
	return nil
}

// SetStockPrices creates a new price entry at the current time for all provided stocks with the given price. Furthermore, this entry is also set to be the current price.
func SetStockPrices(stocks []dto.StockPrice) {
	log.Debug("Setting new stock prices")
	currentTimeStamp := time.Now()

	query := `INSERT INTO stockprice (stockid, price, timestamp) VALUES `
	values := []interface{}{}
	for i, s := range stocks {
		values = append(values, s.ID, s.Price, currentTimeStamp)

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
		return
	}

	query = `UPDATE stocks SET "latestUpdate" = $1 WHERE id IN (`
	values = []interface{}{}
	values = append(values, currentTimeStamp)
	for i, s := range stocks {
		values = append(values, s.ID)

		query += `$` + strconv.Itoa(i+2) + `, `
	}

	query = query[:len(query)-2] + `);`
	_, err = db.Exec(query, values...)

	if err != nil {
		log.Error(err)
		return
	}
	go notifiers.NotifyStockChange()
}

func SetStockColor(stockID int32, color int32) {
	db := getDB()
	var err error

	if color < 0 {
		_, err = db.Exec(`UPDATE stocks SET color=null WHERE id=$1`, stockID)
	} else {
		_, err = db.Exec(`UPDATE stocks SET color=$1 WHERE id=$2`, color, stockID)
	}

	if err != nil {
		log.Error(err)
		return
	}
	go notifiers.NotifyStockChange()
}

// AreActiveStockIDs returns whether all provided IDs are active.
//
// If the slice is empty, returns true.
// If an error occurs, returns false.
func AreActiveStockIDs(ids []int32) bool {
	if len(ids) == 0 {
		return true
	}

	query := `SELECT SUM(CASE
        	WHEN stocks.status = 1 THEN 0
        	WHEN stocks.status = 0 THEN 1
        	WHEN stocks.status > 1 THEN 1
       	END) 
	   	FROM stocks WHERE id IN (`
	values := []interface{}{}
	for i, id := range ids {
		if id <= 0 {
			return false
		}

		values = append(values, id)

		query += `$` + strconv.Itoa(i+1) + `, `

	}
	query = query[:len(query)-2] + `);`

	db := getDB()
	resp := db.QueryRow(query, values...)

	if resp.Err() != nil {
		log.Error(resp.Err())
		return false
	}
	var res int32
	err := resp.Scan(&res)
	if err != nil {
		log.Error(err)
		return false
	}

	return res == 0
}

func StarStockID(stockID int32, userID string) error {
	db := getDB()

	_, err := db.Exec(`INSERT INTO starredstocks ("stockId", "userId") VALUES ($1, $2) ON CONFLICT DO NOTHING;`, stockID, userID)

	if err != nil {
		log.Error(err)
		return err
	}
	return nil
}

func UnstarStockID(stockID int32, userID string) error {
	db := getDB()

	_, err := db.Exec(`DELETE FROM starredstocks WHERE "stockId" = $1 AND "userId" = $2;`, stockID, userID)

	if err != nil {
		log.Error(err)
		return err
	}
	return nil
}

func GetStockIDStarStatus(stockID int32, userID string) bool {
	db := getDB()

	row := db.QueryRow(`SELECT "stockId" FROM starredstocks WHERE "userId" = $1 AND "stockId" = $2;`, userID, stockID)

	if row.Err() != nil {
		log.Error(row.Err())
		return false
	}

	var id int32

	err := row.Scan(&id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false
		}
		log.Error(row.Err())
		return false
	}

	return id == stockID
}
