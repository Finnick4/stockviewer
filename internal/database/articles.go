package database

import (
	"database/sql"
	"errors"
	"fmt"
	"stockviewer/dto"
	"strconv"
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

func EditArticleTitleAndContent(id int32, title string, content string) error {
	log.Infof("Editing article %v...", id)

	db := getDB()
	var err error

	if content != "" {
		_, err = db.Exec(`UPDATE articles SET title=$1, content=$2 WHERE id=$3;`, title, content, id)
	} else {
		_, err = db.Exec(`UPDATE articles SET title=$1, content=NULL WHERE id=$2;`, title, id)
	}

	if err != nil {
		log.Error(err)
		return err
	}
	return nil
}
func EditArticleContent(id int32, content string) error {
	log.Infof("Editing article %v...", id)

	db := getDB()
	var err error

	_, err = db.Exec(`UPDATE articles SET content=$1 WHERE id=$2;`, content, id)

	if err != nil {
		log.Error(err)
		return err
	}
	return nil
}

// GetArticles returns the 10 most recent articles. If an offset is provided, it takes the 10 articles n*10 below.
func GetArticles(offset int32) ([]dto.ArticleOverview, error) {
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

	articles := make([]dto.ArticleOverview, 0, 10)

	for rows.Next() {
		var article dto.ArticleOverview
		err = rows.Scan(&article.ID, &article.Title)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		articles = append(articles, article)
	}
	return articles, nil
}

func GetArticle(id int32) (dto.DetailedArticle, error) {
	log.Debugf("Getting article with id %v", id)
	db := getDB()

	article := dto.DetailedArticle{ID: id}

	row := db.QueryRow(`
	SELECT articles.title, COALESCE(articles.content, ''), COALESCE(articles."creatorId", ''), CASE
	WHEN articles."creatorId" IS NOT NULL THEN users."displayName"
	ELSE ''
	END, articles."createdAt" FROM articles 
		JOIN public.users users on articles."creatorId" = users.id                                                                                      
	WHERE articles.id = $1;`, id)

	err := row.Err()
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return article, nil
		}
		log.Error(err)
		return dto.DetailedArticle{}, err
	}

	err = row.Scan(&article.Title, &article.Content, &article.AuthorID, &article.AuthorDisplayName, &article.TimeCreated)
	if err != nil {
		log.Error(err)
		return dto.DetailedArticle{}, err
	}

	rows, err := db.Query(`
SELECT stockinfluences."stockId", stocks.name, stockinfluences."creatorId", stockinfluences."totalLength", stockinfluences.permille, stockinfluences."falloffType" FROM stockinfluences
	JOIN stocks ON stockinfluences."stockId" = stocks.id
WHERE stockinfluences."articleId" = $1 ORDER BY "stockId";
`, id)
	if err != nil {
		log.Error(err)
		return dto.DetailedArticle{}, err
	}

	defer rows.Close()

	var influences []dto.DetailedInfluence

	for rows.Next() {
		influence := dto.DetailedInfluence{ArticleID: id}

		err = rows.Scan(&influence.StockID, &influence.StockName, &influence.CreatorID, &influence.LengthMinutes, &influence.PermillePerDay, &influence.FalloffType)
		if err != nil {
			log.Error(err)
			return dto.DetailedArticle{}, err
		}
		influences = append(influences, influence)
	}
	article.Influences = influences
	return article, nil
}

func GetAllActiveInfluences() ([]dto.InfluenceFunctional, error) {
	db := getDB()

	rows, err := db.Query(`
	SELECT "stockId", permille, "falloffType", "totalLength", "remainingLength" FROM stockinfluences
	WHERE "remainingLength" > 0 ORDER BY "stockId";`)
	if err != nil {
		log.Error(err)
		return nil, err
	}

	defer rows.Close()

	var influences []dto.InfluenceFunctional

	for rows.Next() {
		influence := dto.InfluenceFunctional{}

		err = rows.Scan(&influence.StockID, &influence.PermillePerDay, &influence.FalloffType, &influence.TotalLength, &influence.RemainingLength)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		influences = append(influences, influence)
	}
	return influences, nil
}
func DecreaseRemainingTime() error {
	db := getDB()

	_, err := db.Exec(`
	UPDATE stockinfluences
	SET "remainingLength" = "remainingLength" - 1
	WHERE "remainingLength" > 0;`)

	if err != nil {
		log.Error(err)
		return err
	}
	return nil
}

func CreateInfluence(influence dto.CreateInfluenceParams) error {
	db := getDB()
	var err error

	if influence.CreatorID != "" {
		_, err = db.Exec(`INSERT INTO stockinfluences ("stockId", "articleId", "creatorId", "totalLength", "remainingLength", permille, "falloffType") 
VALUES ($1, $2, $3, $4, (SELECT GREATEST(0, EXTRACT(EPOCH FROM date_trunc('minutes', "createdAt" + INTERVAL $4 - current_timestamp)) / 60)
FROM articles
WHERE articles.id = $2), $5, $6);
`, influence.StockID, influence.ArticleID, influence.CreatorID, influence.LengthMinutes, influence.PermillePerDay, influence.FalloffType)
	} else {
		_, err = db.Exec(`INSERT INTO stockinfluences ("stockId", "articleId", "totalLength", "remainingLength", permille, "falloffType") 
VALUES ($1, $2, $3, $4, (SELECT GREATEST(0, EXTRACT(EPOCH FROM date_trunc('minutes', "createdAt" + INTERVAL $3 - current_timestamp)) / 60)
FROM articles
WHERE articles.id = $2), $5);`, influence.StockID, influence.ArticleID, influence.LengthMinutes, influence.PermillePerDay, influence.FalloffType)
	}

	if err != nil {
		log.Error(err)
		return err
	}
	return nil
}
func CreateInfluences(influences []dto.CreateInfluenceParams) error {
	query := `INSERT INTO stockinfluences ("stockId", "articleId", "creatorId", "totalLength", "remainingLength", permille, "falloffType") VALUES `
	values := []interface{}{}
	for i, influence := range influences {
		values = append(values, influence.StockID, influence.ArticleID, influence.CreatorID, influence.LengthMinutes, influence.PermillePerDay, influence.FalloffType)

		vals := 6
		n := i * vals
		query += `(`

		for j := 0; j < vals; j++ {
			if (n+j+1)%vals == 4 {
				query += `$` + strconv.Itoa(n+j+1) + fmt.Sprintf(`, (SELECT GREATEST(0, EXTRACT(EPOCH FROM date_trunc('minutes', "createdAt" + ($%v::int * (INTERVAL '1 minute')) - current_timestamp)) / 60) FROM articles WHERE articles.id = $2), `, n+j+1)
			} else {
				query += `$` + strconv.Itoa(n+j+1) + `, `
			}
		}
		query = query[:len(query)-2] + `),`
	}
	query = query[:len(query)-1] + ";"

	db := getDB()
	_, err := db.Exec(query, values...)

	if err != nil {
		log.Error(influences)
		log.Error(err)
		log.Error(query)
		log.Error(values)
		return err
	}

	_, err = db.Exec(`UPDATE stockinfluences SET "creatorId"=null WHERE "creatorId"='';`)

	if err != nil {
		log.Error(err)
		return err
	}

	return nil
}
