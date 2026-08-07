package discovery

import (
	"testing"

	"github.com/anirban-moi/FluxTransfer/backend/internal/models"
)

func TestEncode(t *testing.T) {

	packet := &models.DiscoveryPacket{
		Version:      models.DiscoveryProtocolVersion,
		Type:         models.MessageDiscover,
		DeviceID:     "device-1",
		Name:         "Laptop",
		Hostname:     "DESKTOP",
		Platform:     "windows",
		VersionName:  "0.1.0-dev",
		TransferPort: 53318,
	}

	data, err := Encode(packet)
	if err != nil {
		t.Fatal(err)
	}

	if len(data) == 0 {
		t.Fatal("expected encoded data")
	}
}

func TestDecode(t *testing.T) {

	packet := &models.DiscoveryPacket{
		Version:      models.DiscoveryProtocolVersion,
		Type:         models.MessageDiscover,
		DeviceID:     "device-1",
		Name:         "Laptop",
		Hostname:     "DESKTOP",
		Platform:     "windows",
		VersionName:  "0.1.0-dev",
		TransferPort: 53318,
	}

	data, _ := Encode(packet)

	decoded, err := Decode(data)
	if err != nil {
		t.Fatal(err)
	}

	if decoded.DeviceID != packet.DeviceID {
		t.Fatal("device id mismatch")
	}

	if decoded.Name != packet.Name {
		t.Fatal("device name mismatch")
	}
}

func TestDecodeInvalidJSON(t *testing.T) {

	_, err := Decode([]byte("{invalid"))

	if err == nil {
		t.Fatal("expected decode error")
	}
}
