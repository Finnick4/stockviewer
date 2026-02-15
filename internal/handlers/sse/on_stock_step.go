package sse

import (
	"net/http"
	"stockviewer/internal/notifiers"

	log "github.com/sirupsen/logrus"
)

func SendSSEOnStockStep(w http.ResponseWriter, r *http.Request, send func() error) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	clientGone := r.Context().Done()

	err := send()
	if err != nil {
		log.Error(err)
		return
	}

	stockStepPing, stockStepPingRemove := notifiers.GetStockChangeNotification()

	for {
		select {
		case <-clientGone:
			log.Debug("Client has disconnected from SSE")
			stockStepPingRemove()
			return
		case <-stockStepPing:
			err = send()
			if err != nil {
				log.Error(err)
				stockStepPingRemove()
				return
			}
		}
	}
}
