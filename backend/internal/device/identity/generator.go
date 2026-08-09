package identity

import "github.com/google/uuid"

func GenerateDeviceID() string {
	return uuid.NewString()
}
