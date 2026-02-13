package database

import (
	"database/sql"
	"errors"
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

// GetArticles returns the 10 most recent articles. If an offset is provided, it takes the 10 articles n*10 below.
func GetArticles(offset int32) ([]ArticleOverview, error) {
	log.Debugf("Getting ten articles with offset %v", offset)
	db := getDB()

	if offset < 0 {
		offset = 0
	}

	rows, err := db.Query(`SELECT id, title FROM articles ORDER BY id DESC LIMIT 10 OFFSET $1;`, offset*10)
	defer rows.Close()
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		log.Error(err)
		return nil, err
	}

	articles := make([]ArticleOverview, 0, 10)

	for rows.Next() {
		var article ArticleOverview
		err = rows.Scan(&article.Id, &article.Title)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		articles = append(articles, article)
	}
	return articles, nil
}

func GetArticle(id int32) (Article, error) {
	log.Debugf("Getting article with id %v", id)
	db := getDB()

	article := Article{Id: id}

	row := db.QueryRow(`SELECT title, COALESCE(content, '') FROM articles WHERE id = $1;`, id)

	err := row.Err()
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return article, nil
		}
		log.Error(err)
		return Article{}, err
	}

	err = row.Scan(&article.Title, &article.Content)
	if err != nil {
		log.Error(err)
		return Article{}, err
	}
	return article, nil
}
