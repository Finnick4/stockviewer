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

type LoggedStock struct {
	Name      string
	Shorthand string
	Price     int64
	Color     int32
}
type StockLogEntry struct {
	StockID    int32
	UserID     string
	ActionType int32
	Change     string
}

type LoggedStockGroup struct {
	Name        string
	Description string
}

type StockGroupLogEntry struct {
	StockGroupID int32
	UserID       string
	ActionType   int32
	Change       string
}

type LoggedUser struct {
	Tag         string
	DisplayName string
}

type UserLogEntry struct {
	TargetUserID string
	IssuerUserID string
	ActionType   int32
	Change       string
}
