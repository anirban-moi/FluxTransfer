package heartbeat

import (
	"testing"
	"time"
)

func TestEncodeDecode(
	t *testing.T,
) {

	original := &Packet{
		Version:  1,
		DeviceID: "device-1",
		UnixTime: time.Now().Unix(),
	}

	data, err := Encode(original)
	if err != nil {
		t.Fatalf(
			"Encode() failed: %v",
			err,
		)
	}

	decoded, err := Decode(data)
	if err != nil {
		t.Fatalf(
			"Decode() failed: %v",
			err,
		)
	}

	if decoded.Version != original.Version {
		t.Fatal("Version mismatch")
	}

	if decoded.DeviceID != original.DeviceID {
		t.Fatal("DeviceID mismatch")
	}

	if decoded.UnixTime != original.UnixTime {
		t.Fatal("UnixTime mismatch")
	}
}
