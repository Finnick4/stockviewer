package dto

type UserLoginParams struct {
	Tag      string
	Password string
}

type UserChangePasswordParams struct {
	Tag         string
	OldPassword string
	NewPassword string
}

type UserCreateParams struct {
	Tag      string
	Password string
}

type Permission struct {
	Permission string
	Value      int32
}

type UserIdentification struct {
	Tag  string
	Name string
	ID   string
}

type UserOverview struct {
	ID     string
	Name   string
	Tag    string
	Status string
}

type UserEditPermissionsParams struct {
	Permissions []Permission
}
