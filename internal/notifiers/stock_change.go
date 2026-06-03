package notifiers

import (
	"sync"

	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
)

var openStockChannels = make(map[string]chan bool)
var stockChangeMutex sync.Mutex

func GetStockChangeNotification() (<-chan bool, func()) {
	id := uuid.New().String()

	newChannel := make(chan bool)

	stockChangeMutex.Lock()
	openStockChannels[id] = newChannel
	stockChangeMutex.Unlock()

	return newChannel, func() {
		stockChangeMutex.Lock()
		close(newChannel)
		delete(openStockChannels, id)
		stockChangeMutex.Unlock()
	}
}

func NotifyStockChange() {
	log.Debugf("Stock change happened! To notify: %v", len(openStockChannels))
	stockChangeMutex.Lock()
	wg := sync.WaitGroup{}
	wg.Add(len(openStockChannels))
	for _, c := range openStockChannels {
		go func() {
			c <- true
			wg.Done()
		}()
	}
	wg.Wait()
	stockChangeMutex.Unlock()
}
