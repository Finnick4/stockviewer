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

		if !slices.Contains(ids, val.ID) {
			continue
		}
		stock.ID = 0
		stock.Price = 0

		stock.ID = val.ID

		priceCT := float64(val.Price)

		var factor float64 = float64((rand.Int63()%2050)-1000) / 1440.0 // 1.000 -> 1% in a day
		stock.Price = int64(priceCT + (math.Pow(math.Log10(priceCT)+1, 2)*factor)*1000)
		if stock.Price <= 1 {
			stock.Price = 2
		}
		newStocks = append(newStocks, *stock)

	}
	log.Debugf("Iterations in t=%v => t/entry=%vns", time.Since(t2), time.Since(t2).Nanoseconds()/int64(len(stocks)))

	database.SetStockPrices(newStocks)

	log.Debugf("Successfully stepped all stocks in t=%v", time.Since(t))
}
