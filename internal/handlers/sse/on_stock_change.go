package sse

import (
	"net/http"
	"stockviewer/internal/notifiers"

	log "github.com/sirupsen/logrus"
)

func SendSSEOnStockChange(w http.ResponseWriter, r *http.Request, send func() error) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	clientGone := r.Context().Done()

	err := send()
	if err != nil {
		log.Error(err)
		return
	}

	stockChangePing, stockChangePingRemove := notifiers.GetStockChangeNotification()

	for {
		select {
		case <-clientGone:
			log.Debug("Client has disconnected from SSE")
			stockChangePingRemove()
			return
		case <-stockChangePing:
			err = send()
			if err != nil {
				log.Error(err)
				log.Debug("Closing SSE")
				stockChangePingRemove()
				return
			}
		}
	}
}
