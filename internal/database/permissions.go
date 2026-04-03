package database

import (
	"database/sql"
	"errors"
	"math"
	"stockviewer/dto"
	"strconv"

	log "github.com/sirupsen/logrus"
)

func resetAdminPermissions() {
	id := GetUserIDFromTag("admin")

	permissions := []dto.Permission{
		dto.Permission{Permission: "canCreateStocks", Value: 1},
		dto.Permission{Permission: "canEditStockNames", Value: 1},
		dto.Permission{Permission: "canEditStockColors", Value: 1},
		dto.Permission{Permission: "canEditStockPrices", Value: 1},
		dto.Permission{Permission: "canArchiveStocks", Value: 1},
		dto.Permission{Permission: "isStockArchivist", Value: 1},
		dto.Permission{Permission: "canDisableStocks", Value: 1},

		dto.Permission{Permission: "canCreateUsers", Value: 1},
		dto.Permission{Permission: "canEditUserPermissions", Value: 1},
		dto.Permission{Permission: "canEditUserName", Value: 1},
		dto.Permission{Permission: "canEditUserPassword", Value: 1},
		dto.Permission{Permission: "canDisableUsers", Value: 1},
		dto.Permission{Permission: "canDeleteUsers", Value: 1},

		dto.Permission{Permission: "canCreateArticles", Value: 1},
		dto.Permission{Permission: "canEditArticles", Value: 1},
		dto.Permission{Permission: "canModifyInfluences", Value: 1},
		dto.Permission{Permission: "maxInfluencePermille", Value: -1},

		dto.Permission{Permission: "canCreateStockGroups", Value: 1},
		dto.Permission{Permission: "canEditStockGroupNames", Value: 1},
		dto.Permission{Permission: "canEditStockGroupDescriptions", Value: 1},
		dto.Permission{Permission: "canEditStockGroupMembers", Value: 1},
		dto.Permission{Permission: "canDeleteStockGroups", Value: 1},
	}

	var err error

	err = SetUserPermissions(id, permissions)

	if err != nil {
		log.Error(err)
		return
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

func GetAllTokenPermissions(token string) ([]dto.Permission, error) {
	db := getDB()

	log.Debug("Get all permissions for a token")
	rows, err := db.Query(`SELECT permissions."claimType", permissions."claimValue" FROM permissions WHERE userid=(SELECT userid FROM sessions WHERE sessions.token = $1);`, hash512(token))

	if err != nil {
		log.Error(err)
		return nil, err
	}
	defer rows.Close()

	var perms []dto.Permission

	for rows.Next() {
		var perm dto.Permission
		err = rows.Scan(&perm.Permission, &perm.Value)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		perms = append(perms, perm)
	}
	return perms, nil
}

func GetAllTokenPermissionsMap(token string) (map[string]int32, error) {
	db := getDB()

	log.Debug("Get all permissions for a token")
	rows, err := db.Query(`SELECT permissions."claimType", permissions."claimValue" FROM permissions WHERE userid=(SELECT userid FROM sessions WHERE sessions.token = $1);`, hash512(token))

	if err != nil {
		log.Error(err)
		return nil, err
	}
	defer rows.Close()

	permMap := make(map[string]int32)

	for rows.Next() {
		var perm dto.Permission
		err = rows.Scan(&perm.Permission, &perm.Value)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		permMap[perm.Permission] = perm.Value
	}
	return permMap, nil
}

func GetAllUserIDPermissions(id string) ([]dto.Permission, error) {
	db := getDB()

	log.Debug("Get all permissions for a token")
	rows, err := db.Query(`SELECT permissions."claimType", permissions."claimValue" FROM permissions WHERE userid=$1;`, id)

	if err != nil {
		log.Error(err)
		return nil, err
	}
	defer rows.Close()

	var perms []dto.Permission

	for rows.Next() {
		var perm dto.Permission
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
func SetUserPermission(id string, permission dto.Permission) error {
	db := getDB()
	_, err := db.Exec(`INSERT INTO permissions (userid, "claimType", "claimValue") VALUES ($1, $2, $3) ON CONFLICT(userid, "claimType") DO UPDATE SET "claimValue"=EXCLUDED."claimValue";`, id, permission.Permission, permission.Value)

	if err != nil {
		log.Error(err)
		return err
	}
	return nil
}

func SetUserPermissions(id string, perms []dto.Permission) error {
	log.Debug("Setting permissions of user!")
	query := `INSERT INTO permissions (userid, "claimType", "claimValue") VALUES `
	values := []interface{}{}
	for i, perm := range perms {
		values = append(values, id, perm.Permission, perm.Value)

		vals := 3
		n := i * vals
		query += `(`

		for j := 0; j < vals; j++ {
			query += `$` + strconv.Itoa(n+j+1) + `, `
		}
		query = query[:len(query)-2] + `),`
	}
	query = query[:len(query)-1] + `ON CONFLICT(userid, "claimType") DO UPDATE SET "claimValue"=EXCLUDED."claimValue";`

	db := getDB()
	_, err := db.Exec(query, values...)

	if err != nil {
		log.Error(id)
		log.Error(perms)
		log.Error(err)
		return err
	}

	return nil
}
