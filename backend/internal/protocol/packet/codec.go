package packet

import "encoding/json"

func Encode(
	envelope *Envelope,
) ([]byte, error) {

	return json.Marshal(envelope)
}

func Decode(
	data []byte,
) (*Envelope, error) {

	var envelope Envelope

	if err := json.Unmarshal(
		data,
		&envelope,
	); err != nil {

		return nil, err
	}

	return &envelope, nil
}
