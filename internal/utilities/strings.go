package utilities

import (
	"unicode/utf8"
)

func CharCount(txt string) int {
	return utf8.RuneCountInString(txt)
}
