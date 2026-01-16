package handlers

import (
	"net/http"
	"os"

	log "github.com/sirupsen/logrus"
)

var indexBuffer []byte
var cssBuffer []byte

func HandleIndexHTML(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html")
	_, err := w.Write(indexBuffer)
	if err != nil {
		log.Errorf("Error while trying to serve the index.html: %v", err)
		return
	}
}
func HandleStyleCSS(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/css")
	_, err := w.Write(cssBuffer)
	if err != nil {
		log.Errorf("Error while trying to serve the style.css: %v", err)
		return
	}
}

func initBuffers() {
	log.Debug("Initialising the index and css buffer...")
	index, err := os.ReadFile("./static/index.html")
	if err != nil {
		log.Error(err)
	}
	css, err := os.ReadFile("./static/style.css")
	if err != nil {
		log.Error(err)
	}
	indexBuffer = index
	cssBuffer = css
}
