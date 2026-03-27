package dto

type StockGroupCreateParams struct {
	Name        string
	Description string
	Members     []int32
}

type StockGroupGetParams struct {
	ID      int32
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
	TotalValue  int64
}

type DetailedStockGroup struct {
	ID          int32
	Name        string
	Description string
	Members     []DetailedStock
}
