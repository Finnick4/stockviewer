package dto

type StockGroupCreateParams struct {
	Name        string
	Description string
	Members     []int32
}

type AnonymousStockGroupGetParams struct {
	Members []int32
}

type StockGroupEditParams struct {
	Name           string
	Description    string
	AddedMembers   []int32
	RemovedMembers []int32
}
type StockGroupOverview struct {
	ID          int32
	Name        string
	MemberCount int32
	Stars       int32
	IsStarred   bool
	TotalValue  int64
}

type DetailedStockGroup struct {
	ID          int32
	Name        string
	Description string
	Stars       int32
	IsStarred   bool
	Members     []DetailedStock
}
