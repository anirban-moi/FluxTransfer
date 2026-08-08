package heartbeat

import "encoding/json"

func Encode(
	packet *Packet,
) ([]byte, error) {

	return json.Marshal(packet)
}

func Decode(
	data []byte,
) (*Packet, error) {

	var packet Packet

	if err := json.Unmarshal(
		data,
		&packet,
	); err != nil {

		return nil, err
	}

	return &packet, nil
}
