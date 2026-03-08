package dto

import "time"

type ArticleCreateParams struct {
	Title   string
	Content string
}

type ArticleGetParams struct {
	Offset int32
	ID     int32
}

type ArticleOverview struct {
	ID    int32
	Title string
}

type DetailedArticle struct {
	ID                int32
	Title             string
	Content           string
	AuthorID          string
	AuthorDisplayName string
	TimeCreated       time.Time
}
