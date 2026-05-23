package dto

type LoggedArticle struct {
	Title   string
	Content string
}
type LoggedInfluence struct {
	StockID        int32
	LengthMinutes  int32
	PermillePerDay float64
	FalloffType    int32
}

type ArticleLogEntry struct {
	ArticleID  int32
	UserID     string
	ActionType int32
	Change     string
}
