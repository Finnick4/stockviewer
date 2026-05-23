package database

import (
	"stockviewer/dto"
	"strconv"

	log "github.com/sirupsen/logrus"
)

func LogArticleChange(articleID int32, userID string, actionType int32, change string) {
	db := getDB()

	_, err := db.Exec(`INSERT INTO audit_articles ("targetedArticleId", "issuerId", "actionType", "changedData") VALUES ($1, $2, $3, $4);`, articleID, userID, actionType, change)

	if err != nil {
		log.Errorf("Issue while trying to log article change (article: %v, user: %v, action: %v)", articleID, userID, actionType)
		log.Error(err)
		return
	}
}

func LogArticleChanges(entries []dto.ArticleLogEntry) {
	query := `INSERT INTO audit_articles ("targetedArticleId", "issuerId", "actionType", "changedData") VALUES `
	values := make([]interface{}, len(entries)*4)
	for i, entry := range entries {
		vals := 4
		n := i * vals

		values[n] = entry.ArticleID
		values[n+1] = entry.UserID
		values[n+2] = entry.ActionType
		values[n+3] = entry.Change

		query += `(`

		for j := 0; j < vals; j++ {
			query += `$` + strconv.Itoa(n+j+1) + `, `
		}
		query = query[:len(query)-2] + `),`
	}
	query = query[:len(query)-1] + ";"
	db := getDB()
	_, err := db.Exec(query, values...)

	if err != nil {
		log.Errorf("Issue while trying to log multiple article changes (%v)", entries)
		log.Error(err)
		return
	}
}

func LogStockChange(stockID int32, userID string, actionType int32, change string) {
	db := getDB()

	_, err := db.Exec(`INSERT INTO audit_stocks ("targetedStockId", "issuerId", "actionType", "changedData") VALUES ($1, $2, $3, $4);`, stockID, userID, actionType, change)

	if err != nil {
		log.Errorf("Issue while trying to log stock change (stock: %v, user: %v, action: %v)", stockID, userID, actionType)
		log.Error(err)
		return
	}
}

func LogStockChanges(entries []dto.StockLogEntry) {
	query := `INSERT INTO audit_stocks ("targetedStockId", "issuerId", "actionType", "changedData") VALUES `
	values := make([]interface{}, len(entries)*4)
	for i, entry := range entries {
		vals := 4
		n := i * vals

		values[n] = entry.StockID
		values[n+1] = entry.UserID
		values[n+2] = entry.ActionType
		values[n+3] = entry.Change

		query += `(`

		for j := 0; j < vals; j++ {
			query += `$` + strconv.Itoa(n+j+1) + `, `
		}
		query = query[:len(query)-2] + `),`
	}
	query = query[:len(query)-1] + ";"
	db := getDB()
	_, err := db.Exec(query, values...)

	if err != nil {
		log.Errorf("Issue while trying to log multiple stock changes (%v)", entries)
		log.Error(err)
		return
	}
}

func LogStockGroupChange(stockGroupID int32, userID string, actionType int32, change string) {
	db := getDB()

	_, err := db.Exec(`INSERT INTO audit_stock_groups ("targetedStockGroupId", "issuerId", "actionType", "changedData") VALUES ($1, $2, $3, $4);`, stockGroupID, userID, actionType, change)

	if err != nil {
		log.Errorf("Issue while trying to log stock group change (group: %v, user: %v, action: %v)", stockGroupID, userID, actionType)
		log.Error(err)
		return
	}
}

func LogStockGroupChanges(entries []dto.StockGroupLogEntry) {
	query := `INSERT INTO audit_stock_groups ("targetedStockGroupId", "issuerId", "actionType", "changedData") VALUES `
	values := make([]interface{}, len(entries)*4)
	for i, entry := range entries {
		vals := 4
		n := i * vals

		values[n] = entry.StockGroupID
		values[n+1] = entry.UserID
		values[n+2] = entry.ActionType
		values[n+3] = entry.Change

		query += `(`

		for j := 0; j < vals; j++ {
			query += `$` + strconv.Itoa(n+j+1) + `, `
		}
		query = query[:len(query)-2] + `),`
	}
	query = query[:len(query)-1] + ";"
	db := getDB()
	_, err := db.Exec(query, values...)

	if err != nil {
		log.Errorf("Issue while trying to log multiple stock group changes (%v)", entries)
		log.Error(err)
		return
	}
}
