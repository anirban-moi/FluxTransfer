package pairing

import (
	"net"
	"sync"
	"time"
)

type PendingRequest struct {
	DeviceID string
	Name     string
	Hostname string
	Platform string
	Address  *net.UDPAddr

	CreatedAt time.Time
}

type PendingRegistry struct {
	mu sync.RWMutex

	requests map[string]*PendingRequest
}

func NewPendingRegistry() *PendingRegistry {

	return &PendingRegistry{
		requests: make(
			map[string]*PendingRequest,
		),
	}

}

func (r *PendingRegistry) Add(
	request *PendingRequest,
) {

	r.mu.Lock()
	defer r.mu.Unlock()

	r.requests[request.DeviceID] = request

}

func (r *PendingRegistry) Get(
	deviceID string,
) (*PendingRequest, bool) {

	r.mu.RLock()
	defer r.mu.RUnlock()

	request, ok := r.requests[deviceID]

	return request, ok

}

func (r *PendingRegistry) List() []*PendingRequest {

	r.mu.RLock()
	defer r.mu.RUnlock()

	requests := make(
		[]*PendingRequest,
		0,
		len(r.requests),
	)

	for _, request := range r.requests {

		requests = append(
			requests,
			request,
		)

	}

	return requests

}

func (r *PendingRegistry) Remove(
	deviceID string,
) {

	r.mu.Lock()
	defer r.mu.Unlock()

	delete(
		r.requests,
		deviceID,
	)

}
