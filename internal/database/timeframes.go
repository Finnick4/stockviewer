package database

// GenerateTimeframe returns a Timeframe of a given scope. If the scope is invalid the returned timeframe will consist of default values.
func GenerateTimeframe(scope int64) Timeframe {
	switch scope {
	case 1:
		return Timeframe{count: 30, bucketWidth: "1 minute"} // 30 minutes
	case 2:
		return Timeframe{count: 30, bucketWidth: "2 minutes"} // 1 hour
	case 3:
		return Timeframe{count: 30, bucketWidth: "12 minutes"} // 6 hours
	case 4:
		return Timeframe{count: 30, bucketWidth: "48 minutes"} // 24 hours
	default:
		return Timeframe{count: 0, bucketWidth: "0 minutes"}
	}
}

func IsValidTimeframeScope(scope int64) bool {
	return scope > 0 && scope <= 4
}
