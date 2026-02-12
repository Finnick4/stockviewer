package database

import (
	"database/sql"
	"errors"
	"time"

	"golang.org/x/crypto/bcrypt"

	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
)

func createAdminUser() {
	log.Info("Creating admin user...")
	err := CreateUser("admin", "admin123!", "")
	if err != nil {
		log.Debug(err)
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

// IsCorrectPassword returns whether the given username has the given password.
func IsCorrectPassword(username string, pw string) bool {
	resp := db.QueryRow(`SELECT password FROM users WHERE name = $1;`, username)
	var hashedPW string
	err := resp.Scan(&hashedPW)
	if err != nil {
		log.Error(err)
		return false
	}

	return bcrypt.CompareHashAndPassword([]byte(hashedPW), []byte(pw)) == nil
}

// EditPasswordFromUserID sets the given password for the user with the given ID
func EditPasswordFromUserID(id string, password string) error {
	hashedPW, err := hashPW(password)
	if err != nil {
		log.Error(err)
		return err
	}
	db := getDB()
	_, err = db.Exec(`UPDATE users SET password=$1, status=(CASE
    							WHEN status=2 THEN 1
    							ELSE status END) 
							WHERE id=$2;`, hashedPW, id)
	if err != nil {
		log.Error(err)
		return err
	}
	return nil
}

// GetUserIDFromToken returns the ID of the user that bears the given token.
func GetUserIDFromToken(token string) string {
	resp := db.QueryRow(`SELECT userid FROM sessions WHERE token = $1;`, hash512(token))
	var val string
	err := resp.Scan(&val)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ""
		}
		log.Error(err)
		return ""
	}
	return val
}

// GetUserNameFromToken returns the name of the user that bears the given token.
func GetUserNameFromToken(token string) string {
	resp := db.QueryRow(`SELECT name FROM users WHERE id = (SELECT userid FROM sessions WHERE token = $1)`, hash512(token))
	var val string
	err := resp.Scan(&val)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ""
		}
		log.Error(err)
		return ""
	}
	return val
}

// GetUserIDFromName returns the ID of the username. If there is no ID found or any other error this function returns an empty string
func GetUserIDFromName(name string) string {
	resp := db.QueryRow(`SELECT id FROM users WHERE name = $1;`, name)
	var val string
	err := resp.Scan(&val)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ""
		}
		log.Error(err)
		return ""
	}
	return val
}

// GetUserIDStatus returns the status set in the users table for a token.
func GetUserIDStatus(userid string) int32 {
	resp := db.QueryRow(`SELECT status FROM users WHERE id = $1;`, userid)
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

func CreateUser(name string, password string, creatorID string) error {
	log.Info("Creating new user...")

	db := getDB()
	id := uuid.New().String()
	created := time.Now()
	hashedPW, err := hashPW(password)
	status := 2

	if err != nil {
		log.Error(err)
		return err
	}
	if creatorID == "" {
		_, err = db.Exec(`INSERT INTO users (id, name, created, password, status, "creatorId") VALUES ($1, $2, $3, $4, $5, $6)`, id, name, created, hashedPW, status, creatorID)
	} else {
		_, err = db.Exec(`INSERT INTO users (id, name, created, password, status) VALUES ($1, $2, $3, $4, $5)`, id, name, created, hashedPW, status)

	}

	if err != nil {
		log.Error(err)
		return err
	}
	return nil
}
