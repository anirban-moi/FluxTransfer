package registry

import (
	"testing"

	"github.com/anirban-moi/FluxTransfer/backend/internal/models"
)

func TestAddDevice(t *testing.T) {

	reg := New()

	device := &models.Device{
		ID:   "device-1",
		Name: "Workstation",
	}

	if !reg.Add(device) {
		t.Fatal("expected device to be added")
	}

	if len(reg.List()) != 1 {
		t.Fatal("expected one device")
	}
}

func TestDuplicateDevice(t *testing.T) {

	reg := New()

	device := &models.Device{
		ID: "device-1",
	}

	reg.Add(device)

	if reg.Add(device) {
		t.Fatal("expected duplicate add to fail")
	}
}

func TestRemoveDevice(t *testing.T) {

	reg := New()

	device := &models.Device{
		ID: "device-1",
	}

	reg.Add(device)

	if !reg.Remove(device.ID) {
		t.Fatal("expected remove to succeed")
	}

	if len(reg.List()) != 0 {
		t.Fatal("expected registry to be empty")
	}
}

func TestUpdateDevice(t *testing.T) {

	reg := New()

	device := &models.Device{
		ID:   "device-1",
		Name: "Old Name",
	}

	reg.Add(device)

	device.Name = "New Name"

	if !reg.Update(device) {
		t.Fatal("expected update to succeed")
	}

	updated, ok := reg.Get(device.ID)
	if !ok {
		t.Fatal("device not found")
	}

	if updated.Name != "New Name" {
		t.Fatal("device name was not updated")
	}
}

func TestMarkOffline(t *testing.T) {

	reg := New()

	device := &models.Device{
		ID:     "device-1",
		Status: models.StatusOnline,
	}

	reg.Add(device)

	if !reg.MarkOffline(device.ID) {
		t.Fatal("expected mark offline to succeed")
	}

	updated, _ := reg.Get(device.ID)

	if updated.Status != models.StatusOffline {
		t.Fatal("expected device to be offline")
	}
}
