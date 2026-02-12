package utilities

import "unicode"

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
	l := CharCount(tag)
	return !(l < 3 || l > 32)
}
