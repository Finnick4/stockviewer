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

func SetArticleAsViewedForUserID(articleID int32, userID string) {
	db := getDB()

	_, err := db.Exec(`INSERT INTO articleviews ("articleId", "userId") VALUES ($1, $2) ON CONFLICT ("articleId", "userId") DO NOTHING;`, articleID, userID)

	if err != nil {
		log.Error(err)
		return
	}
	return
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
func RemoveArticleContent(id int32) error {
	log.Infof("Removing content of article %v", id)

	db := getDB()
	var err error

	_, err = db.Exec(`UPDATE articles SET content=NULL WHERE id=$1;`, id)

	if err != nil {
		log.Error(err)
		return err
	}
	return nil
}

func DeleteArticle(id int32) error {
	log.Infof("Deleting article %v", id)

	db := getDB()

	_, err := db.Exec(`DELETE FROM articles WHERE id=$1;`, id)

	if err != nil {
		log.Error(err)
		return err
	}
	return nil
}

// GetArticles returns the 10 most recent articles. If an offset is provided, it takes the 10 articles n*10 below.
func GetArticles(offset int32, userID string) ([]dto.ArticleOverview, error) {
	log.Debugf("Getting ten articles with offset %v", offset)
	db := getDB()

	if offset < 0 {
		offset = 0
	}

	rows, err := db.Query(`
SELECT id, title, COUNT(DISTINCT stockinfluences."stockId"), COUNT(DISTINCT articleviews."userId"), EXISTS(SELECT 1 FROM articleviews WHERE "userId" = $1 AND articleviews."articleId" = id) FROM articles
    LEFT JOIN stockinfluences ON articles.id = stockinfluences."articleId"
	LEFT JOIN articleviews ON articles.id = articleviews."articleId"
GROUP BY id, title ORDER BY id DESC LIMIT 10 OFFSET $2;`, userID, offset*10)
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
		err = rows.Scan(&article.ID, &article.Title, &article.TotalInfluences, &article.TotalViews, &article.Viewed)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		articles = append(articles, article)
	}
	return articles, nil
}

func GetUnreadArticles(offset int32, userID string) ([]dto.ArticleOverview, error) {
	log.Debugf("Getting ten unread articles with offset %v", offset)
	db := getDB()

	if offset < 0 {
		offset = 0
	}

	rows, err := db.Query(`
SELECT articles.id, title, COUNT(DISTINCT stockinfluences."stockId") AS affected, COUNT(DISTINCT articleviews."userId") AS views, false AS viewed FROM articles
    LEFT JOIN stockinfluences ON articles.id = stockinfluences."articleId"
    LEFT JOIN articleviews ON articles.id = articleviews."articleId"
WHERE (NOT EXISTS(SELECT 1 FROM articleviews WHERE "userId" = $1 AND articleviews."articleId" = articles.id))
  AND (SELECT created FROM users WHERE "id" = $1) < articles."createdAt"
GROUP BY articles.id, title ORDER BY id DESC LIMIT 10 OFFSET $2;`, userID, offset*10)
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
		err = rows.Scan(&article.ID, &article.Title, &article.TotalInfluences, &article.TotalViews, &article.Viewed)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		articles = append(articles, article)
	}
	return articles, nil
}

func GetArticle(articleID int32, userID string) (dto.DetailedArticle, error) {
	log.Debugf("Getting article with id %v", articleID)
	db := getDB()

	article := dto.DetailedArticle{ID: articleID}

	row := db.QueryRow(`
		SELECT articles.title, COALESCE(articles.content, ''), COALESCE(articles."creatorId", ''), CASE
		WHEN articles."creatorId" IS NOT NULL THEN users."displayName"
		ELSE ''
		END, articles."createdAt", COUNT(DISTINCT articleviews."userId"), EXISTS(SELECT 1 FROM articleviews WHERE "articleId" = $1 AND "userId" = $2) FROM articles 
			JOIN users ON articles."creatorId" = users.id
			LEFT JOIN articleviews ON articles.id = articleviews."articleId"
		WHERE articles.id = $1 
		GROUP BY articles.title, articles.content, articles."creatorId", users."displayName", articles."createdAt";`, articleID, userID)

	err := row.Err()
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return article, nil
		}
		log.Error(err)
		return dto.DetailedArticle{}, err
	}

	err = row.Scan(&article.Title, &article.Content, &article.AuthorID, &article.AuthorDisplayName, &article.TimeCreated, &article.TotalViews, &article.Viewed)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return dto.DetailedArticle{}, err
		}
		log.Error(err)
		return dto.DetailedArticle{}, err
	}

	rows, err := db.Query(`
SELECT stockinfluences."stockId", stocks.name, stockinfluences."creatorId", stockinfluences."totalLength", stockinfluences.permille, stockinfluences."falloffType" FROM stockinfluences
	JOIN stocks ON stockinfluences."stockId" = stocks.id AND stocks.status = 1
WHERE stockinfluences."articleId" = $1 ORDER BY "stockId";
`, articleID)
	if err != nil {
		log.Error(err)
		return dto.DetailedArticle{}, err
	}

	defer rows.Close()

	var influences []dto.InfluenceByArticle

	for rows.Next() {
		influence := dto.InfluenceByArticle{ArticleID: articleID}

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
		JOIN stocks ON stockinfluences."stockId" = stocks.id AND stocks.status = 1
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

func GetArticlesActivelyAffectingStarredStocksAndStarredStockGroups(userID string) ([]dto.ArticleOverview, error) {
	db := getDB()

	rows, err := db.Query(`
	SELECT articles.id, articles.title, COUNT(DISTINCT articleviews."userId") AS views,
       EXISTS(SELECT 1 FROM articleviews WHERE articleviews."articleId" = articles.id AND "userId" = $1) AS viewed,
       COUNT(DISTINCT stocks.id) AS "affected", SUM(ABS(permille))
FROM articles
         JOIN stockinfluences ON stockinfluences."articleId" = articles.id
         LEFT JOIN articleviews ON articles.id = articleviews."articleId"
         JOIN stocks ON stockinfluences."stockId" = stocks.id
WHERE stockinfluences."remainingLength" > 0 AND "stockId"
    IN (SELECT DISTINCT stocks.id
        FROM stocks
               LEFT JOIN starredstocks ON stocks.id = starredstocks."stockId"
               LEFT JOIN stockgroupmembers ON stocks.id = stockgroupmembers."stockId"
               LEFT JOIN starredstockgroups ON stockgroupmembers."groupId" = starredstockgroups."groupId"
        WHERE ((starredstocks."userId" = $1 AND stocks.id = starredstocks."stockId")
          OR (starredstockgroups."userId" = $1 AND stockgroupmembers."groupId" = starredstockgroups."groupId")))
GROUP BY articles.id, articles.title
ORDER BY articles.id DESC LIMIT 10;`, userID)
	if err != nil {
		log.Error(err)
		return nil, err
	}

	defer rows.Close()

	var articles []dto.ArticleOverview

	for rows.Next() {
		article := dto.ArticleOverview{}

		err = rows.Scan(&article.ID, &article.Title, &article.TotalViews, &article.Viewed, &article.TotalRelevantInfluences, &article.TotalRelevantAbsPermille)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		articles = append(articles, article)
	}
	return articles, nil
}

func GetUnreadArticlesActivelyAffectingStarredStocksAndStarredStockGroups(userID string) ([]dto.ArticleOverview, error) {
	db := getDB()

	rows, err := db.Query(`
SELECT articles.id, articles.title, COUNT(DISTINCT articleviews."userId") AS views,
       false AS viewed,
       COUNT(DISTINCT stocks.id) AS "affected", SUM(ABS(permille))
FROM articles
         JOIN stockinfluences ON stockinfluences."articleId" = articles.id
         LEFT JOIN articleviews ON articles.id = articleviews."articleId"
         JOIN stocks ON stockinfluences."stockId" = stocks.id
WHERE stockinfluences."remainingLength" > 0
  AND (SELECT created FROM users WHERE "id" = $1) < articles."createdAt"
  AND NOT(EXISTS(SELECT 1 FROM articleviews WHERE articleviews."articleId" = articles.id AND "userId" = $1))
  AND "stockId"
    IN (SELECT DISTINCT stocks.id
        FROM stocks
                 LEFT JOIN starredstocks ON stocks.id = starredstocks."stockId"
                 LEFT JOIN stockgroupmembers ON stocks.id = stockgroupmembers."stockId"
                 LEFT JOIN starredstockgroups ON stockgroupmembers."groupId" = starredstockgroups."groupId"
        WHERE ((starredstocks."userId" = $1 AND stocks.id = starredstocks."stockId")
            OR (starredstockgroups."userId" = $1 AND stockgroupmembers."groupId" = starredstockgroups."groupId")))
GROUP BY articles.id, articles.title
ORDER BY articles.id DESC LIMIT 10;`, userID)
	if err != nil {
		log.Error(err)
		return nil, err
	}

	defer rows.Close()

	var articles []dto.ArticleOverview

	for rows.Next() {
		article := dto.ArticleOverview{}

		err = rows.Scan(&article.ID, &article.Title, &article.TotalViews, &article.Viewed, &article.TotalRelevantInfluences, &article.TotalRelevantAbsPermille)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		articles = append(articles, article)
	}
	return articles, nil
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
VALUES ($1, $2, $3, $4, (SELECT GREATEST(0, EXTRACT(EPOCH FROM date_trunc('minutes', "createdAt" + ($4::int * (INTERVAL '1 minute')) - current_timestamp)) / 60)
FROM articles
WHERE articles.id = $2), $5, $6);
`, influence.StockID, influence.ArticleID, influence.CreatorID, influence.LengthMinutes, influence.PermillePerDay, influence.FalloffType)
	} else {
		_, err = db.Exec(`INSERT INTO stockinfluences ("stockId", "articleId", "totalLength", "remainingLength", permille, "falloffType") 
VALUES ($1, $2, $3, $4, (SELECT GREATEST(0, EXTRACT(EPOCH FROM date_trunc('minutes', "createdAt" + ($3::int * (INTERVAL '1 minute')) - current_timestamp)) / 60)
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
	log.Debug("Creating influences!")
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

func RemoveInfluence(articleID int32, stockID int32) error {
	log.Debugf("Removing influence on stock %v from article %v", stockID, articleID)
	db := getDB()

	_, err := db.Exec(`DELETE FROM stockinfluences WHERE "articleId" = $1 AND "stockId" = $2;`, articleID, stockID)

	if err != nil {
		log.Error(err)
		return err
	}

	return nil
}

func RemoveInfluences(articleID int32, stockIDs []int32) error {
	log.Debugf("Removing influence on stocks %v from article %v", stockIDs, articleID)

	query := `DELETE FROM stockinfluences WHERE "articleId" = $1 AND "stockId" IN (`
	values := []interface{}{}
	values = append(values, articleID)
	for i, s := range stockIDs {
		values = append(values, s)

		query += `$` + strconv.Itoa(i+2) + `, `
	}
	query = query[:len(query)-2] + ");"
	db := getDB()
	_, err := db.Exec(query, values...)

	if err != nil {
		log.Error(err)
		return err
	}

	return nil
}

func EditInfluence(influence dto.InfluenceEditParams) error {
	log.Debugf("Editing influence on stock %v from article %v", influence.StockID, influence.ArticleID)
	db := getDB()

	_, err := db.Exec(`
UPDATE stockinfluences
SET permille = $1,
    "falloffType" = $2,
    "totalLength" = $3,
    "remainingLength" = GREATEST(0, EXTRACT(EPOCH FROM date_trunc('minutes', a."createdAt" + ($3::int * (INTERVAL '1 minute')) - current_timestamp)) / 60) FROM articles a
WHERE "articleId" = $4 AND "stockId" = $5 AND stockinfluences."articleId" = a.id;`, influence.PermillePerDay, influence.FalloffType, influence.LengthMinutes, influence.ArticleID, influence.StockID)

	if err != nil {
		log.Error(err)
		return err
	}

	return nil
}

func EditInfluences(influences []dto.InfluenceEditParams) error {
	query := `
UPDATE stockinfluences
SET permille = v.permille,
    "falloffType" = v.falloff,
    "totalLength" = v.len,
	"remainingLength" = GREATEST(0, EXTRACT(EPOCH FROM date_trunc('minutes', articles."createdAt" + (v.len * (INTERVAL '1 minute')) - current_timestamp)) / 60)
FROM (VALUES 
`
	values := []interface{}{}
	for i, influence := range influences {
		values = append(values, influence.StockID, influence.ArticleID, influence.PermillePerDay, influence.FalloffType, influence.LengthMinutes)

		vals := 5
		n := i * vals
		query += `(`

		for j := 0; j < vals; j++ {
			query += `$` + strconv.Itoa(n+j+1) + `::int, `
		}
		query = query[:len(query)-2] + `),`
	}
	query = query[:len(query)-1] + `) AS v("stockId", "articleId", permille, falloff, len)
JOIN articles ON v."articleId" = articles.id
WHERE stockinfluences."stockId" = v."stockId";`

	db := getDB()
	_, err := db.Exec(query, values...)

	if err != nil {
		log.Error(query)
		log.Error(values)
		log.Error(err)
		return err
	}
	return nil
}
