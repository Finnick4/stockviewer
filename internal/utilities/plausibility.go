package utilities

func IsPlausiblePassword(pw string) bool {
	l := CharCount(pw)
	return !(l < 8 || l > 72)
}

func IsPlausibleUsername(name string) bool {
	l := CharCount(name)
	return !(l < 3 || l > 32)
}
