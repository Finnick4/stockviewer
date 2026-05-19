package stocks

import (
	"math"
	"math/rand"
	"stockviewer/dto"
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
	influences, err := database.GetAllActiveInfluences()

	if err != nil {
		log.Error(err)
		return
	}
	currentInfluenceIndex := 0

	newStocks := make([]dto.StockPrice, 0, len(stocks))

	stock := new(dto.StockPrice)

	t2 := time.Now()
	for _, val := range stocks {
		stock.ID = val.ID

		priceCT := float64(val.Price)
		var influenceFactor float64 = 0.0
		for i := currentInfluenceIndex; i < len(influences); i++ {
			if influences[i].StockID == stock.ID {
				currentInfluenceIndex = i
				progressPercentage := (float64(influences[i].RemainingLength) / float64(influences[i].TotalLength)) * 100
				switch influences[i].FalloffType {
				case 0:
					influenceFactor += GetNoneFalloffInfluenceFactor(influences[i].PermillePerDay, progressPercentage)
				case 1:
					influenceFactor += GetLinearFalloffInfluenceFactor(influences[i].PermillePerDay, progressPercentage)
				case 2:
					influenceFactor += GetDelayedLinearFalloffInfluenceFactor(influences[i].PermillePerDay, progressPercentage)
				default:
					influenceFactor += GetLinearFalloffInfluenceFactor(influences[i].PermillePerDay, progressPercentage)
				}
				log.Debugf("Current influence factor: %v", influenceFactor)
			} else {
				break
			}
		}
		influenceFactor /= 10

		var factor float64 = (float64((rand.Int63()%2050)-1000) + influenceFactor /* 1.000 -> 1% in a day */) / 1440.0
		stock.Price = int64(priceCT + (math.Pow(math.Log10(priceCT)+1, 2)*factor)*1000)
		if stock.Price <= 1 {
			stock.Price = 2
		}
		newStocks = append(newStocks, *stock)

	}
	log.Debugf("Iterations in t=%v => t/entry=%vns", time.Since(t2), time.Since(t2).Nanoseconds()/int64(len(stocks)))

	err = database.DecreaseRemainingTime()
	if err != nil {
		log.Error(err)
		log.Error("Could not finish stepping all stocks!")
		return
	}
	database.SetStockPrices(newStocks)

	log.Debugf("Successfully stepped all stocks in t=%v", time.Since(t))
}
