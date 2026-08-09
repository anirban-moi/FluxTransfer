package pairing

import "encoding/json"

func EncodeRequest(
	packet *Request,
) ([]byte, error) {

	return json.Marshal(packet)
}

func EncodeResponse(
	packet *Response,
) ([]byte, error) {

	return json.Marshal(packet)
}
