package database

import (
	"crypto/rand"
	"crypto/sha512"
	"encoding/hex"
	"time"

	log "github.com/sirupsen/logrus"
)

// hash512 returns a sha512 of the given string and returns it as a hexadecimal string
func hash512(toHash string) string {
	hashed := sha512.Sum512([]byte(toHash))
	return hex.EncodeToString(hashed[:])
}

// genToken returns a string containing a 64 character long token
func genToken() (string, error) {
	bytes := make([]byte, 32)
	_, err := rand.Read(bytes)
	if err != nil {
		log.Error(err)
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// GenerateNewToken creates a new token and stores it in the database (hashed) for the given ID. The returned token is not hashed.
func GenerateNewToken(id string) (string, error) {
	token, err := genToken()
	if err != nil {
		log.Error(err)
		return "", err
	}

	tokenHash := hash512(token)

	expiry := time.Now().Add(time.Hour * 24 * 30)

	_, err = db.Exec(`UPDATE users SET token = $1, "tokenExpireDate" = $2 WHERE id = $3`, tokenHash, expiry, id)

	if err != nil {
		log.Error(err)
		return "", err
	}

	return token, nil
}
