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

func resetAdminPermissions() {
	id := GetUserIDFromName("admin")

	permissions := []Permission{
		Permission{Permission: "canCreateStocks", Value: 1},
		Permission{Permission: "canModifyStockNames", Value: 1},
		Permission{Permission: "canArchiveStocks", Value: 1},
		Permission{Permission: "isStockArchivist", Value: 1},
		Permission{Permission: "canDisableStocks", Value: 1},
	}

	var err error

	for _, perm := range permissions {
		err = SetUserPermission(id, perm)
		if err != nil {
			log.Error(err)
			return
		}
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
	_, err = db.Exec(`UPDATE users SET password=$1 WHERE id=$2`, hashedPW, id)

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
