package database

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"errors"
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
	hashedPW, err := hashPW("admin")
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

func hashPW(toHash string) (string, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(toHash), 14)
	if err != nil {
		log.Error("Failed to hash the provided password!")
		log.Error(err)
		return "", err
	}
	return string(hashed), nil
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

	tokenHash, err := hashPW(token)
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

// SetUserPermission sets or updates the permission of a user.
func SetUserPermission(id string, permission string, value int32) error {
	resp := db.QueryRow(`SELECT id FROM permissions WHERE userid = $1 AND "claimType" = $2;`, id, permission)
	var price int64
	err := resp.Scan(&price)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// b) create new permission entry
			_, error2 := db.Exec(`INSERT INTO permissions (userid, "claimType", "claimValue") VALUES ($1, $2, $3)`, id, permission, value)

			if error2 != nil {
				log.Error(error2)
				return error2
			}
			return nil
		} else {
			log.Fatal(err)
		}
	}

	// a) Update existing permission
	_, err = db.Exec(`UPDATE permissions SET "claimValue" = $1 WHERE "claimType" = $2 AND userid = $3`, value, permission, id)

	if err != nil {
		log.Error(err)
		return err
	}
	return nil
}
