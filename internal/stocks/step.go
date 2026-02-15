package stocks

import (
	"math"
	"math/rand"
	"slices"
	"stockviewer/internal/database"
	"time"

	log "github.com/sirupsen/logrus"
)

func Step() {
	log.Debug("Stepping all stocks forth")
	t := time.Now()
	var err error

	stocks, err := database.GetStockPrices()

	if err != nil {
		log.Error(err)
		return
	}
	if len(stocks) == 0 {
		log.Debug("As there are no stocks with prices present, stepping was aborted!")
		return
	}

	newStocks := make([]database.StockPrice, 0, len(stocks))

	ids, err := database.GetActiveStockIds()

	if err != nil {
		log.Error(err)
		return
	}

	log.Debugf("Following ids are stepped: %v", ids)

	stock := new(database.StockPrice)

	t2 := time.Now()
	for _, val := range stocks {

		if !slices.Contains(ids, val.Id) {
			continue
		}
		stock.Id = 0
		stock.Price = 0

		stock.Id = val.Id

		var factor float64 = float64((rand.Int63()%2050)-1000) / 1000.0
		stock.Price = int64(((float64(val.Price) / 100) + math.Pow(math.Log10(float64(val.Price))+1, 2)*factor) * 100)
		if stock.Price <= 1 {
			stock.Price = 2
		}
		newStocks = append(newStocks, *stock)

	}
	log.Debugf("Iterations in t=%v => t/entry=%vns", time.Since(t2), time.Since(t2).Nanoseconds()/int64(len(stocks)))

	database.SetStockPrices(newStocks)

	log.Debugf("Successfully stepped all stocks in t=%v", time.Since(t))
}
