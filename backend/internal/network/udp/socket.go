package udp

import (
	"fmt"
	"net"
)

func Listen(
	port int,
) (*net.UDPConn, error) {

	addr, err := net.ResolveUDPAddr(
		"udp4",
		fmt.Sprintf(":%d", port),
	)
	if err != nil {
		return nil, err
	}

	return net.ListenUDP(
		"udp4",
		addr,
	)
}

func Dial(
	port int,
) (*net.UDPConn, error) {

	addr, err := net.ResolveUDPAddr(
		"udp4",
		fmt.Sprintf(
			"255.255.255.255:%d",
			port,
		),
	)
	if err != nil {
		return nil, err
	}

	return net.DialUDP(
		"udp4",
		nil,
		addr,
	)
}
