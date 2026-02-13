package database

import (
	"database/sql"
	"time"

	log "github.com/sirupsen/logrus"
)

func CreateArticle(title string, content string, creatorID string) (int32, error) {
	log.Info("Creating new article...")

	db := getDB()
	created := time.Now()
	var resp *sql.Row

	if creatorID != "" {
		if content != "" {
			resp = db.QueryRow(`INSERT INTO articles ("creatorId", title, content, "createdAt") VALUES ($1, $2, $3, $4) RETURNING id`, creatorID, title, content, created)
		} else {
			resp = db.QueryRow(`INSERT INTO articles ("creatorId", title, "createdAt") VALUES ($1, $2, $3) RETURNING id`, creatorID, title, created)
		}
	} else {
		if content != "" {
			resp = db.QueryRow(`INSERT INTO articles (title, content, "createdAt") VALUES ($1, $2, $3) RETURNING id`, title, content, created)
		} else {
			resp = db.QueryRow(`INSERT INTO articles (title, "createdAt") VALUES ($1, $2) RETURNING id`, title, created)
		}

	}

	err := resp.Err()

	if err != nil {
		log.Error(err)
		return 0, err
	}

	var lastID int32
	err = resp.Scan(&lastID)

	if err != nil {
		log.Error(err)
		return 0, err
	}
	return lastID, nil
}
