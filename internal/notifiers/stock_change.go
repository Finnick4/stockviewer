package notifiers

import (
	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
)

var openStockChannels = make(map[string]chan bool)

func GetStockChangeNotification() (<-chan bool, func()) {
	id := uuid.New().String()

	newChannel := make(chan bool)

	openStockChannels[id] = newChannel

	return newChannel, func() {
		close(newChannel)
		delete(openStockChannels, id)
	}
}

func NotifyStockChange() {
	log.Debugf("Stock change happened! To notify: %v", len(openStockChannels))
	for _, c := range openStockChannels {
		go func() {
			c <- true
		}()
	}
}
