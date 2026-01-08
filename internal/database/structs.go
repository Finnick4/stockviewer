package database

import "time"

type CurrentStockData struct {
	Id           int64
	Name         string
	Price        int64
	DeltaAmount  int64
	DeltaPercent float64
}

type StockPrice struct {
	Id    int64
	Price int64
}

type StockPriceTime struct {
	Price     int64
	Timestamp time.Time
}

type Timeframe struct {
	count       int64
	bucketWidth string
}

type PriceDelta struct {
	ID           int64
	Name         string
	Price1       int64
	Price2       int64
	DeltaAmount  int64
	DeltaPercent float64
}
