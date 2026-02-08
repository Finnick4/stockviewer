package utilities

import "strings"

func CharCount(txt string) int {
	return strings.Count(txt, "")
}
