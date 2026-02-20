package database

import (
	"database/sql"
	"errors"
	"math"

	log "github.com/sirupsen/logrus"
)

func resetAdminPermissions() {
	id := GetUserIDFromTag("admin")

	permissions := []Permission{
		Permission{Permission: "canCreateStocks", Value: 1},
		Permission{Permission: "canEditStockNames", Value: 1},
		Permission{Permission: "canEditStockPrices", Value: 1},
		Permission{Permission: "canArchiveStocks", Value: 1},
		Permission{Permission: "isStockArchivist", Value: 1},
		Permission{Permission: "canDisableStocks", Value: 1},

		Permission{Permission: "canCreateUsers", Value: 1},
		Permission{Permission: "canEditUserPermission", Value: 1},
		Permission{Permission: "canEditUserName", Value: 1},
		Permission{Permission: "canEditUserPassword", Value: 1},
		Permission{Permission: "canDisableUser", Value: 1},
		Permission{Permission: "canDeleteUser", Value: 1},

		Permission{Permission: "canCreateArticles", Value: 1},
		Permission{Permission: "canEditArticles", Value: 1},

		Permission{Permission: "canCreateStockGroups", Value: 1},
		Permission{Permission: "canEditStockGroupNames", Value: 1},
		Permission{Permission: "canEditStockGroupMembers", Value: 1},
		Permission{Permission: "canDeleteStockGroups", Value: 1},
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

// GetTokenPermission returns the permission value of user associated with the token.
// If the queried permission is to be interpreted as a bool, use HasTokenPermission instead!
func GetTokenPermission(token string, permission string) int32 {
	db := getDB()
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

// HasTokenPermission returns whether the user associated with the token has the given boolean permission.
// This function will technically still run if the permission isn't supposed to be interpreted as a boolean.
func HasTokenPermission(token string, permission string) bool {
	return GetTokenPermission(token, permission) == 1
}

func GetAllTokenPermissions(token string) ([]Permission, error) {
	db := getDB()

	log.Debug("Get all permissions for a token")
	rows, err := db.Query(`SELECT permissions."claimType", permissions."claimValue" FROM permissions WHERE userid=(SELECT userid FROM sessions WHERE sessions.token = $1);`, hash512(token))

	if err != nil {
		log.Error(err)
		return nil, err
	}
	defer rows.Close()

	var perms []Permission

	for rows.Next() {
		var perm Permission
		err = rows.Scan(&perm.Permission, &perm.Value)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		perms = append(perms, perm)
	}
	return perms, nil
}

// SetUserPermission sets or updates the permission of a user.
func SetUserPermission(id string, permission Permission) error {
	db := getDB()
	resp := db.QueryRow(`SELECT id FROM permissions WHERE userid = $1 AND "claimType" = $2;`, id, permission.Permission)
	var permValue int32
	err := resp.Scan(&permValue)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// b) create new permission entry
			_, error2 := db.Exec(`INSERT INTO permissions (userid, "claimType", "claimValue") VALUES ($1, $2, $3)`, id, permission.Permission, permission.Value)

			if error2 != nil {
				log.Error(error2)
				return error2
			}
			return nil
		}

		log.Fatal(err)
	}

	// a) Update existing permission
	_, err = db.Exec(`UPDATE permissions SET "claimValue" = $1 WHERE "claimType" = $2 AND userid = $3`, permission.Value, permission.Permission, id)

	if err != nil {
		log.Error(err)
		return err
	}
	return nil
}
