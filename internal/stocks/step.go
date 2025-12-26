package stocks

import (
	"math"
	"math/rand"
	"slices"
	"stockviewer/internal/database"

	log "github.com/sirupsen/logrus"
)

func Step() {
	var stocks, newStocks []database.StockPrice
	var err error

	log.Debug("Stepping all stocks forth")

	stocks, err = database.GetStockPrices()

	if err != nil {
		log.Error(err)
		return
	}

	ids, err := database.GetStockIds()

	if err != nil {
		log.Error(err)
		return
	}

	for _, val := range stocks {
		if !slices.Contains(ids, val.Id) {
			continue
		}
		stock := new(database.StockPrice)
		stock.Id = val.Id

		var factor float64 = float64((rand.Int63()%2050)-1000) / 1000.0
		stock.Price = val.Price + math.Pow(math.Log10(val.Price), 2)*factor

		newStocks = append(newStocks, *stock)
	}

	database.SetStockPrices(newStocks)
}
