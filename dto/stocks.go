package dto

import "time"

type StockCreateParams struct {
	Name      string
	Shorthand string
	InitPrice int64
	Color     int32
}
type StockGetParams struct {
	Timeframe int64
}
type StockGetHistoryParams struct {
	ID        int64
	Timeframe int64
}

type StarParams struct {
	Result bool
}

type ArchiveParams struct {
	Result bool
}

type StockDeleteParams struct {
	Password string
}

type DetailedStock struct {
	ID        int32
	Name      string
	Shorthand string
	Price     int64
	Stars     int32
	IsStarred bool
	Color     int32
}

type StockPrice struct {
	ID    int32
	Price int64
}

type StockPriceTime struct {
	Price     int64
	Timestamp time.Time
}

type PriceDelta struct {
	ID           int64
	Name         string
	Shorthand    string
	Color        int32
	Price1       int64
	Price2       int64
	DeltaAmount  int64
	DeltaPercent float64
	Stars        int32
	IsStarred    bool
}
