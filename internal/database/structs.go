package database

import "time"

type CurrentStockData struct {
	ID    int32
	Name  string
	Price int64
}

type StockPrice struct {
	ID    int32
	Price int64
}

type StockPriceTime struct {
	Price     int64
	Timestamp time.Time
}

type Timeframe struct {
	count       int64
	bucketWidth string
	totalWidth  string
}

type PriceDelta struct {
	ID           int64
	Name         string
	Price1       int64
	Price2       int64
	DeltaAmount  int64
	DeltaPercent float64
}

type Permission struct {
	Permission string
	Value      int32
}

type UserIdentification struct {
	Tag  string
	Name string
	ID   string
}

type ArticleOverview struct {
	ID    int32
	Title string
}

type Article struct {
	ID      int32
	Title   string
	Content string
}

type StockGroup struct {
	ID          int32
	Name        string
	MemberCount int32
	TotalValue  int64
}

type DetailedStockGroup struct {
	ID          int32
	Name        string
	Description string
	Members     []CurrentStockData
}
