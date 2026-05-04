package dto

import (
	"fmt"
)

var MaxDetailLevel int64

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

// GenerateTimeframe returns a Timeframe of a given length in minutes. If the scope is invalid the returned timeframe will consist of default values.
func GenerateTimeframe(length int64) Timeframe {
	if length < MaxDetailLevel {
		MaxDetailLevel = length
	}
	if length == -1 {
		return Timeframe{count: MaxDetailLevel, bucketWidth: "", totalWidth: "AllTime"}
	}
	if length <= 0 {
		return Timeframe{count: 0, bucketWidth: "0 minutes", totalWidth: "0 minutes"}
	}

	return Timeframe{count: MaxDetailLevel, bucketWidth: fmt.Sprintf("%v minutes", float64(length)/float64(MaxDetailLevel)), totalWidth: fmt.Sprintf("%v minutes", length)}
}

func IsValidTimeframeLength(length int64) bool {
	return length == -1 || length > 0
}
