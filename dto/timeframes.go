package dto

type Timeframe struct {
	count       int64
	bucketWidth string
	totalWidth  string
}

func (tf Timeframe) Count() int64 {
	return tf.count
}
func (tf Timeframe) BucketWidth() string {
	return tf.bucketWidth
}
func (tf Timeframe) TotalWidth() string {
	return tf.totalWidth
}

// GenerateTimeframe returns a Timeframe of a given scope. If the scope is invalid the returned timeframe will consist of default values.
func GenerateTimeframe(scope int64) Timeframe {
	switch scope {
	case -1:
		return Timeframe{count: 30, bucketWidth: "", totalWidth: "AllTime"} // 30 minutes
	case 1:
		return Timeframe{count: 30, bucketWidth: "1 minute", totalWidth: "30 minutes"} // 30 minutes
	case 2:
		return Timeframe{count: 30, bucketWidth: "2 minutes", totalWidth: "60 minutes"} // 1 hour
	case 3:
		return Timeframe{count: 30, bucketWidth: "12 minutes", totalWidth: "6 hours"} // 6 hours
	case 4:
		return Timeframe{count: 30, bucketWidth: "48 minutes", totalWidth: "24 hours"} // 24 hours
	default:
		return Timeframe{count: 0, bucketWidth: "0 minutes", totalWidth: "0 minutes"}
	}
}

func IsValidTimeframeScope(scope int64) bool {
	return scope == -1 || (scope > 0 && scope <= 4)
}
