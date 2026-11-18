package transfer

import (
	"encoding/json"

	"github.com/anirban-moi/FluxTransfer/backend/internal/models"
)

func EncodeRequest(packet *models.TransferRequest) ([]byte, error) {
	return json.Marshal(packet)
}

func DecodeRequest(data []byte) (*models.TransferRequest, error) {
	var packet models.TransferRequest
	if err := json.Unmarshal(data, &packet); err != nil {
		return nil, err
	}
	return &packet, nil
}

func EncodeResponse(packet *models.TransferResponse) ([]byte, error) {
	return json.Marshal(packet)
}

func DecodeResponse(data []byte) (*models.TransferResponse, error) {
	var packet models.TransferResponse
	if err := json.Unmarshal(data, &packet); err != nil {
		return nil, err
	}
	return &packet, nil
}
