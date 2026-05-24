package users

import (
	"os"

	log "github.com/sirupsen/logrus"
)

var httpsOnly bool
var initialised = false

func HTTPSOnlyMode() bool {
	if initialised {
		return httpsOnly
	}

	https, ok := os.LookupEnv("HTTPS_MODE")
	if !ok {
		log.Warn("HTTPS_MODE is not set in .env! Interpreting this as false!")
		https = "false"
	}

	httpsOnly = https == "true"
	initialised = true
	return httpsOnly
}
