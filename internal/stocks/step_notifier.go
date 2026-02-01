package stocks

import (
	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
)

var openChannels = make(map[string]chan bool)

func GetNewStepNotification() (<-chan bool, func()) {
	id := uuid.New().String()

	newChannel := make(chan bool)

	openChannels[id] = newChannel

	return newChannel, func() {
		close(newChannel)
		delete(openChannels, id)
	}
}

func notifyOfStockStep() {
	log.Debugf("Stock step happened! To notify: %v", len(openChannels))
	for _, c := range openChannels {
		go func() {
			c <- true
		}()
	}
}
