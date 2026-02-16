package database

import (
	"crypto/rand"
	"crypto/sha512"
	"database/sql"
	"encoding/hex"
	"errors"
	"time"

	"github.com/google/uuid"
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
func GenerateNewToken(userid string) (string, error) {
	db := getDB()
	token, err := genToken()
	if err != nil {
		log.Error(err)
		return "", err
	}

	id := uuid.New().String()

	tokenHash := hash512(token)

	expiry := time.Now().Add(time.Hour * 24 * 30)

	_, err = db.Exec(`INSERT INTO sessions (id, token, "lastUsage", "expireDate", userid) VALUES ($1, $2, $3, $4, $5);`, id, tokenHash, time.Now(), expiry, userid)

	if err != nil {
		log.Error(err)
		return "", err
	}

	return token, nil
}

// GetTokenStatus returns the status set in the users table for a token.
func GetTokenStatus(token string) int32 {
	db := getDB()
	resp := db.QueryRow(`SELECT status FROM users WHERE id = (SELECT userid FROM sessions WHERE token = $1);`, hash512(token))
	var val int32
	err := resp.Scan(&val)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0
		}
		log.Error(err)
		return 0
	}
	return val
}

func RemoveToken(token string) {
	log.Debug("Removing token")
	db := getDB()
	_, err := db.Exec(`DELETE FROM sessions WHERE token = $1`, hash512(token))
	if err != nil {
		log.Error(err)
	}
}

func RevokeAllTokensFromUserID(userid string) {
	db := getDB()

	_, err := db.Exec(`DELETE FROM sessions WHERE userid = $1`, userid)

	if err != nil {
		log.Error(err)
	}
}
