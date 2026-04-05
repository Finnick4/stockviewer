package utilities

import (
	"strconv"
	"unicode"
)

func IsPlausiblePassword(pw string) bool {
	l := CharCount(pw)
	return !(l < 8 || l > 72)
}

func IsPlausibleUserTag(tag string) bool {
	for _, char := range tag {
		switch {
		case unicode.IsLower(char):
			continue
		case unicode.IsDigit(char):
			continue
		default:
			return false
		}
	}
	_, err := strconv.Atoi(tag)
	l := CharCount(tag)
	return !(l < 2 || l > 32) && err != nil
}
func IsPlausibleUserName(name string) bool {
	l := CharCount(name)
	return l >= 2 && l <= 32
}

func IsValidFalloffType(t int32) bool {
	return t >= 0 && t < 4
}
