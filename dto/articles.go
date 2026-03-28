package dto

import "time"

type ArticleCreateParams struct {
	Title      string
	Content    string
	Influences []CreateInfluenceParams
}

type ArticleEditParams struct {
	ID                int32
	Title             string
	Content           string
	RemoveContent     bool
	AddedInfluences   []CreateInfluenceParams
	EditedInfluences  []InfluenceEditParams
	RemovedInfluences []int32
}

type ArticleGetParams struct {
	Offset int32
}

type ArticleOverview struct {
	ID              int32
	Title           string
	TotalInfluences int32
	TotalViews      int64
	Viewed          bool
}

type DetailedArticle struct {
	ID                int32
	Title             string
	Content           string
	AuthorID          string
	AuthorDisplayName string
	TimeCreated       time.Time
	Influences        []InfluenceByArticle
	TotalViews        int64
	Viewed            bool
}

type CreateInfluenceParams struct {
	StockID        int32
	ArticleID      int32
	CreatorID      string
	LengthMinutes  int32
	PermillePerDay float64
	FalloffType    int32
}

type InfluenceEditParams struct {
	StockID        int32
	ArticleID      int32
	CreatorID      string
	LengthMinutes  int32
	PermillePerDay float64
	FalloffType    int32
}

type InfluenceByArticle struct {
	StockID        int32
	StockName      string
	ArticleID      int32
	CreatorID      string
	LengthMinutes  int32
	PermillePerDay float32
	FalloffType    int32
}
type InfluenceOnStock struct {
	ArticleID      int32
	ArticleTitle   string
	LengthMinutes  int32
	PermillePerDay float32
	FalloffType    int32
}

type InfluenceFunctional struct {
	StockID         int32
	PermillePerDay  float32
	FalloffType     int32
	TotalLength     int32
	RemainingLength int32
}
