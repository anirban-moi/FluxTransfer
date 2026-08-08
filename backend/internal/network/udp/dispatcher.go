package udp

import (
	"net"
)

type Dispatcher struct {
	handlers []Handler
}

func NewDispatcher() *Dispatcher {

	return &Dispatcher{
		handlers: make(
			[]Handler,
			0,
		),
	}
}

func (d *Dispatcher) Register(
	handler Handler,
) {
	d.handlers = append(
		d.handlers,
		handler,
	)
}

func (d *Dispatcher) Handle(
	data []byte,
	addr *net.UDPAddr,
) {
	for _, handler := range d.handlers {

		handler.Handle(
			data,
			addr,
		)

	}
}
