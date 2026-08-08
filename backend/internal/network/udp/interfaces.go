package udp

import "net"

type Handler interface {
	Handle(
		data []byte,
		addr *net.UDPAddr,
	)
}
