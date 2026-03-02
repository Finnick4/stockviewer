package notifiers

import (
	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
)

var openStockGroupChannels = make(map[string]chan bool)

func GetStockGroupChangeNotification() (<-chan bool, func()) {
	id := uuid.New().String()

	newChannel := make(chan bool)

	openStockGroupChannels[id] = newChannel

	return newChannel, func() {
		close(newChannel)
		delete(openStockGroupChannels, id)
	}
}

func NotifyStockGroupChange() {
	log.Debugf("Stock group change happened! To notify: %v", len(openStockGroupChannels))
	for _, c := range openStockGroupChannels {
		go func() {
			c <- true
		}()
	}
}
