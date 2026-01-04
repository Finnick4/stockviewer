package database

import "time"

type CurrentStockData struct {
	Id    int64
	Name  string
	Price int64
}

type StockPrice struct {
	Id    int64
	Price int64
}

type StockPriceTime struct {
	Id        int64
	Price     int64
	Timestamp time.Time
}

type Timeframe struct {
	count       int64
	bucketWidth string
}
