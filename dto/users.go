package dto

import (
	"errors"
)

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

type EditUserParams struct {
	Name     string
	Tag      string
	Password string
}

var ErrTagAlreadyUsed = errors.New("there is already a user with the same tag present")
