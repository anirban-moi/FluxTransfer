package pairing

import "encoding/json"

func DecodeRequest(
	data []byte,
) (*Request, error) {

	var packet Request

	if err := json.Unmarshal(
		data,
		&packet,
	); err != nil {
		return nil, err
	}

	return &packet, nil
}

func DecodeResponse(
	data []byte,
) (*Response, error) {

	var packet Response

	if err := json.Unmarshal(
		data,
		&packet,
	); err != nil {
		return nil, err
	}

	return &packet, nil
}
