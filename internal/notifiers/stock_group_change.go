package notifiers

import (
	"sync"

	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
)

var openStockGroupChannels = make(map[string]chan bool)
var stockGroupChangeMutex sync.Mutex

func GetStockGroupChangeNotification() (<-chan bool, func()) {
	id := uuid.New().String()

	newChannel := make(chan bool)

	stockGroupChangeMutex.Lock()
	openStockGroupChannels[id] = newChannel
	stockGroupChangeMutex.Unlock()

	return newChannel, func() {
		close(newChannel)
		stockGroupChangeMutex.Lock()
		delete(openStockGroupChannels, id)
		stockGroupChangeMutex.Unlock()
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
