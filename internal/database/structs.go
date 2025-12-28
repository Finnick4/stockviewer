package database

type CurrentStockData struct {
	Id    int64
	Name  string
	Price float64
}

type StockPrice struct {
	Id    int64
	Price float64
}

type StockPriceTime struct {
	Id        int64
	Price     float64
	Timestamp int64
}
