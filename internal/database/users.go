package database

import (
	"crypto/rand"
	"encoding/hex"
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
	hashedPW, err := hash("admin")
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

func hash(toHash string) (string, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(toHash), 14)
	if err != nil {
		log.Error("Failed to hash the provided password!")
		log.Error(err)
		return "", err
	}
	return string(hashed), nil
}

func genToken() (string, error) {
	bytes := make([]byte, 64)
	_, err := rand.Read(bytes)
	if err != nil {
		log.Error(err)
		return "", err
	}
	return hex.EncodeToString(bytes), nil

}

func GenerateNewToken(id string) (string, error) {
	token, err := genToken()
	if err != nil {
		log.Error(err)
		return "", err
	}

	tokenHash, err := hash(token)
	if err != nil {
		log.Error(err)
		return "", err
	}

	expiry := time.Now().Add(time.Hour * 24 * 30)

	_, err = db.Exec(`UPDATE users SET token = $1, "tokenExpireDate" = $2 WHERE id = $3`, tokenHash, expiry, id)

	if err != nil {
		log.Error(err)
		return "", err
	}

	return token, nil
}
