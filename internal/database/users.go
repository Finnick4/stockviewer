package database

import (
	"database/sql"
	"errors"
	"stockviewer/dto"
	"strings"
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
func IsCorrectPassword(tag string, pw string) bool {
	db := getDB()
	resp := db.QueryRow(`SELECT password FROM users WHERE tag = $1;`, tag)
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
	db := getDB()
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

// GetUserTagFromToken returns the tag of the user that bears the given token.
func GetUserTagFromToken(token string) string {
	db := getDB()
	resp := db.QueryRow(`SELECT tag FROM users WHERE id = (SELECT userid FROM sessions WHERE token = $1)`, hash512(token))
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

// GetUserNameAndTagFromToken returns the name and tag of the user that bears the given token.
func GetUserNameAndTagFromToken(token string) (dto.UserIdentification, error) {
	var info dto.UserIdentification
	db := getDB()
	rows, err := db.Query(`SELECT tag, "displayName", id FROM users WHERE id = (SELECT userid FROM sessions WHERE token = $1)`, hash512(token))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return info, nil
		}
		log.Error(err)
		return info, err
	}

	defer rows.Close()

	for rows.Next() {
		err = rows.Scan(&info.Tag, &info.Name, &info.ID)
		if err != nil {
			log.Error(err)
			return info, err
		}
	}

	return info, nil
}

// GetUserIDFromTag returns the ID of the user tag. If there is no ID found or any other error this function returns an empty string
func GetUserIDFromTag(tag string) string {
	db := getDB()
	resp := db.QueryRow(`SELECT id FROM users WHERE tag = $1;`, tag)
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
	db := getDB()
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

func CreateUser(tag string, password string, creatorID string) error {
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
	if creatorID != "" {
		_, err = db.Exec(`INSERT INTO users (id, tag, created, password, status, "creatorId", "displayName") VALUES ($1, $2, $3, $4, $5, $6, $2)`, id, tag, created, hashedPW, status, creatorID)
	} else {
		_, err = db.Exec(`INSERT INTO users (id, tag, created, password, status, "displayName") VALUES ($1, $2, $3, $4, $5, $2)`, id, tag, created, hashedPW, status)

	}

	if err != nil {
		if strings.HasPrefix(err.Error(), "pq: duplicate key value") {
			return dto.ErrTagAlreadyUsed
		}
		log.Error(err)
		return err
	}
	return nil
}

func GetAllUsers() ([]dto.UserOverview, error) {
	log.Debugf("Getting all users")

	db := getDB()

	rows, err := db.Query(`SELECT id, tag, "displayName", status FROM users`)

	if err != nil {
		log.Error(err)
		return nil, err
	}

	defer rows.Close()

	var data []dto.UserOverview

	for rows.Next() {
		var currentData dto.UserOverview
		err = rows.Scan(&currentData.ID, &currentData.Tag, &currentData.Name, &currentData.Status)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		data = append(data, currentData)
	}

	return data, nil
}

func SetUserDisplayName(userID string, name string) error {
	db := getDB()
	_, err := db.Exec(`UPDATE users SET "displayName"=$1 WHERE id=$2;`, name, userID)
	if err != nil {
		log.Error(err)
		return err
	}
	return nil
}

func SetUserTag(userID string, tag string) error {
	db := getDB()
	_, err := db.Exec(`UPDATE users SET tag=$1 WHERE id=$2;`, tag, userID)
	if err != nil {
		if strings.HasPrefix(err.Error(), "pq: duplicate key value") {
			return dto.ErrTagAlreadyUsed
		}
		log.Error(err)
		return err
	}
	return nil
}

func SetUserTagAndName(userID string, tag string, name string) error {
	db := getDB()
	_, err := db.Exec(`UPDATE users SET tag=$1, "displayName"=$2 WHERE id=$3;`, tag, name, userID)
	if err != nil {
		if strings.HasPrefix(err.Error(), "pq: duplicate key value") {
			return dto.ErrTagAlreadyUsed
		}
		log.Error(err)
		return err
	}
	return nil
}

func ResetUserPassword(userID string, pw string) error {
	log.Infof("Password of %v was reset!", userID)
	hashedPW, err := hashPW(pw)
	if err != nil {
		log.Error(err)
		return err
	}
	db := getDB()
	_, err = db.Exec(`UPDATE users SET password=$1, status=2 WHERE id=$2;`, hashedPW, userID)
	if err != nil {
		log.Error(err)
		return err
	}
	return nil
}

func DeleteUser(userID string) error {
	db := getDB()

	_, err := db.Exec(`DELETE FROM users WHERE id=$1;`, userID)

	if err != nil {
		log.Error(err)
		return err
	}
	return nil
}
