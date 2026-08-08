package packet

import "testing"

func TestEncodeDecode(
	t *testing.T,
) {

	original := &Envelope{
		Type: TypeHeartbeat,
		Payload: []byte(
			`{"deviceId":"abc"}`,
		),
	}

	data, err := Encode(original)

	if err != nil {
		t.Fatal(err)
	}

	decoded, err := Decode(data)

	if err != nil {
		t.Fatal(err)
	}

	if decoded.Type != original.Type {

		t.Fatal("Type mismatch")

	}

}
