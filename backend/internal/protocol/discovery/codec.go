package discovery

import (
	"encoding/json"
	"fmt"

	"github.com/anirban-moi/FluxTransfer/backend/internal/models"
)

func Encode(
	packet *models.DiscoveryPacket,
) ([]byte, error) {

	data, err := json.Marshal(packet)
	if err != nil {
		return nil, fmt.Errorf(
			"failed to encode discovery packet: %w",
			err,
		)
	}

	return data, nil
}

func Decode(
	data []byte,
) (*models.DiscoveryPacket, error) {

	var packet models.DiscoveryPacket

	if err := json.Unmarshal(
		data,
		&packet,
	); err != nil {

		return nil, fmt.Errorf(
			"failed to decode discovery packet: %w",
			err,
		)
	}

	return &packet, nil
}
