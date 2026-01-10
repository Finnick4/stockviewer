package database

import (
	"time"

	"golang.org/x/crypto/bcrypt"

	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
)

func createAdminUser() {
	log.Info("Creating admin user...")

	id := uuid.New().String()
	name := "admin"
	created := time.Now()
	hashedPW, err := hashPassword("admin")
	status := 2

	if err != nil {
		log.Error(err)
		return
	}

	_, err = db.Exec("INSERT INTO users (id, name, created, password, status) VALUES ($1, $2, $3, $4, $5)", id, name, created, hashedPW, status)

	if err != nil {
		log.Error(err)
		return
	}
}

func hashPassword(pw string) (string, error) {
	hashedPW, err := bcrypt.GenerateFromPassword([]byte(pw), 14)
	if err != nil {
		log.Error("Failed to hash the provided password!")
		log.Error(err)
		return "", err
	}
	return string(hashedPW), nil
}
