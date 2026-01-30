package database

import (
	"database/sql"
	"errors"
	"math"
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

// SetUserPermission sets or updates the permission of a user.
func SetUserPermission(id string, permission string, value int32) error {
	resp := db.QueryRow(`SELECT id FROM permissions WHERE userid = $1 AND "claimType" = $2;`, id, permission)
	var permValue int64
	err := resp.Scan(&permValue)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// b) create new permission entry
			_, error2 := db.Exec(`INSERT INTO permissions (userid, "claimType", "claimValue") VALUES ($1, $2, $3)`, id, permission, value)

			if error2 != nil {
				log.Error(error2)
				return error2
			}
			return nil
		}

		log.Fatal(err)
	}

	// a) Update existing permission
	_, err = db.Exec(`UPDATE permissions SET "claimValue" = $1 WHERE "claimType" = $2 AND userid = $3`, value, permission, id)

	if err != nil {
		log.Error(err)
		return err
	}
	return nil
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

// GetTokenPermission returns the permission value of user associated with the token.
// If the queried permission is to be interpreted as a bool, use HasTokenPermission instead!
func GetTokenPermission(token string, permission string) int32 {
	resp := db.QueryRow(`SELECT "claimValue" FROM permissions WHERE "claimType" = $1 AND userid = (SELECT userid FROM sessions WHERE sessions.token = $2);`, permission, hash512(token))
	var val int32
	err := resp.Scan(&val)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0
		}
		log.Error(err)
		return math.MinInt32
	}
	return val
}

// GetIDFromName returns the ID of the username. If there is no ID found or any other error this function returns an empty string
func GetIDFromName(name string) string {
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

// HasTokenPermission returns whether the user associated with the token has the given boolean permission.
// This function will technically still run if the permission isn't supposed to be interpreted as a boolean.
func HasTokenPermission(token string, permission string) bool {
	return GetTokenPermission(token, permission) == 1
}
