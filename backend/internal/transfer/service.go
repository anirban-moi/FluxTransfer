package transfer

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"net"
	"os"
	"sync"

	"github.com/anirban-moi/FluxTransfer/backend/internal/config"
	"github.com/anirban-moi/FluxTransfer/backend/internal/device"
	"github.com/anirban-moi/FluxTransfer/backend/internal/logger"
	"github.com/anirban-moi/FluxTransfer/backend/internal/models"
	"github.com/anirban-moi/FluxTransfer/backend/internal/network/udp"
	packetprotocol "github.com/anirban-moi/FluxTransfer/backend/internal/protocol/packet"
	transferprotocol "github.com/anirban-moi/FluxTransfer/backend/internal/protocol/transfer"
	"github.com/anirban-moi/FluxTransfer/backend/internal/trusted"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type Service struct {
	logger         *logger.Logger
	device         *models.Device
	deviceService  device.Service
	trustedService *trusted.Service
	udpSender      *udp.Sender
	config         config.TransferConfig

	server *Server
	client *Client

	mu           sync.RWMutex
	sessions     map[string]*Session
	pending      map[string]*models.TransferRequest
	pendingAddrs map[string]*net.UDPAddr
}

func New(
	log *logger.Logger,
	device *models.Device,
	deviceService device.Service,
	trustedService *trusted.Service,
	udpSender *udp.Sender,
	cfg config.TransferConfig,
) *Service {
	s := &Service{
		logger:         log,
		device:         device,
		deviceService:  deviceService,
		trustedService: trustedService,
		udpSender:      udpSender,
		config:         cfg,
		sessions:       make(map[string]*Session),
		pending:        make(map[string]*models.TransferRequest),
		pendingAddrs:   make(map[string]*net.UDPAddr),
	}

	s.server = NewServer(log, cfg.Port, s)
	s.client = NewClient(log, cfg.ChunkSize, cfg.Timeout)

	return s
}

func (s *Service) Start(ctx context.Context) error {
	s.logger.Info("Transfer service starting")
	return s.server.Start(ctx)
}

func (s *Service) Shutdown(ctx context.Context) error {
	s.logger.Info("Transfer service shutting down")

	s.mu.Lock()
	for _, sess := range s.sessions {
		sess.Cancel()
	}
	s.mu.Unlock()

	return s.server.Shutdown(ctx)
}

func (s *Service) GetSession(id string) (*Session, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	sess, ok := s.sessions[id]
	return sess, ok
}

func (s *Service) InitiateTransfer(
	ctx context.Context,
	targetDeviceID string,
	filePath string,
) (*Session, error) {
	// 1. Security Check: Device must be paired & trusted
	if _, ok := s.trustedService.Get(targetDeviceID); !ok {
		return nil, fmt.Errorf("target device %s is not paired or trusted", targetDeviceID)
	}

	targetDevice, ok := s.deviceService.Get(targetDeviceID)
	if !ok || targetDevice.IPAddress == "" {
		return nil, fmt.Errorf("target device %s is not reachable or has no IP address", targetDeviceID)
	}

	// 2. Inspect Source File
	fileInfo, err := os.Stat(filePath)
	if err != nil {
		return nil, fmt.Errorf("invalid file path: %w", err)
	}
	if fileInfo.IsDir() {
		return nil, fmt.Errorf("directory transfers are not yet supported directly")
	}

	// 3. Compute Checksum (SHA-256)
	checksum, err := calculateFileSHA256(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to calculate checksum: %w", err)
	}

	transferID := uuid.New().String()
	session := NewSession(
		ctx,
		transferID,
		models.TransferDirectionOutgoing,
		fileInfo.Name(),
		fileInfo.Size(),
		checksum,
		targetDevice.ID,
		targetDevice.Name,
	)
	session.FilePath = filePath
	session.RemoteAddress = targetDevice.IPAddress
	session.RemotePort = s.config.Port

	s.mu.Lock()
	s.sessions[transferID] = session
	s.mu.Unlock()

	// 4. Send TransferRequest via UDP Control Channel
	reqPacket := &models.TransferRequest{
		TransferID: transferID,
		SenderID:   s.device.ID,
		SenderName: s.device.Name,
		TargetID:   targetDevice.ID,
		FileName:   fileInfo.Name(),
		FileSize:   fileInfo.Size(),
		TotalFiles: 1,
		Checksum:   checksum,
		Port:       s.config.Port,
	}

	payload, err := transferprotocol.EncodeRequest(reqPacket)
	if err != nil {
		return nil, err
	}

	envelope := &packetprotocol.Envelope{
		Type:    packetprotocol.TypeTransferRequest,
		Payload: payload,
	}

	data, err := packetprotocol.Encode(envelope)
	if err != nil {
		return nil, err
	}

	targetAddr := &net.UDPAddr{
		IP:   net.ParseIP(targetDevice.IPAddress),
		Port: 53317,
	}

	s.logger.Info(
		"Sending transfer request to peer",
		zap.String("transferId", transferID),
		zap.String("targetDevice", targetDevice.Name),
		zap.String("fileName", fileInfo.Name()),
		zap.Int64("fileSize", fileInfo.Size()),
		zap.String("targetAddress", targetAddr.String()),
	)

	if err := s.udpSender.Send(data, targetAddr); err != nil {
		session.SetError(err)
		return nil, err
	}

	return session, nil
}

func (s *Service) HandleTransferRequest(
	packet *models.TransferRequest,
	addr *net.UDPAddr,
) {
	s.logger.Info(
		"Transfer request received via UDP",
		zap.String("transferId", packet.TransferID),
		zap.String("fromSender", packet.SenderName),
		zap.String("fileName", packet.FileName),
		zap.Int64("fileSize", packet.FileSize),
		zap.String("fromAddress", addr.String()),
	)

	// Security Verification: Is Sender Paired?
	if _, ok := s.trustedService.Get(packet.SenderID); !ok {
		s.logger.Warn(
			"Rejecting transfer request from unauthorized/unpaired device",
			zap.String("senderId", packet.SenderID),
		)
		s.sendTransferResponse(packet.TransferID, addr, false, "Sender is not paired", 0)
		return
	}

	s.mu.Lock()
	s.pending[packet.TransferID] = packet
	s.pendingAddrs[packet.TransferID] = addr
	s.mu.Unlock()
}

func (s *Service) HandleTransferResponse(
	packet *models.TransferResponse,
	addr *net.UDPAddr,
) {
	s.logger.Info(
		"Transfer response received via UDP",
		zap.String("transferId", packet.TransferID),
		zap.Bool("accepted", packet.Accepted),
		zap.String("reason", packet.Reason),
		zap.Int("port", packet.Port),
	)

	s.mu.RLock()
	session, ok := s.sessions[packet.TransferID]
	s.mu.RUnlock()

	if !ok {
		s.logger.Warn("Received transfer response for unknown session", zap.String("transferId", packet.TransferID))
		return
	}

	if !packet.Accepted {
		session.SetError(fmt.Errorf("transfer rejected by receiver: %s", packet.Reason))
		return
	}

	// Target accepted: Start TCP file streaming
	targetPort := packet.Port
	if targetPort <= 0 {
		targetPort = s.config.Port
	}

	targetIP := addr.IP.String()
	if targetDevice, ok := s.deviceService.Get(session.RemoteDeviceID); ok && targetDevice.IPAddress != "" {
		targetIP = targetDevice.IPAddress
	}

	s.logger.Info(
		"Receiver accepted transfer, launching streaming worker",
		zap.String("transferId", session.TransferID),
		zap.String("targetIP", targetIP),
		zap.Int("targetPort", targetPort),
	)

	go func() {
		if err := s.client.StreamFile(session.Context(), session, targetIP, targetPort); err != nil {
			s.logger.Error("File streaming failed", zap.String("transferId", session.TransferID), zap.Error(err))
		}
	}()
}

func (s *Service) AcceptTransfer(transferID string, saveDir string) error {
	s.mu.Lock()
	req, ok := s.pending[transferID]
	if !ok {
		s.mu.Unlock()
		return fmt.Errorf("pending transfer request not found: %s", transferID)
	}
	cachedAddr := s.pendingAddrs[transferID]
	delete(s.pending, transferID)
	delete(s.pendingAddrs, transferID)

	targetDevice, _ := s.deviceService.Get(req.SenderID)
	senderName := req.SenderName
	if targetDevice != nil && targetDevice.Name != "" {
		senderName = targetDevice.Name
	}

	if saveDir == "" {
		saveDir = s.config.SaveDir
	}

	session := NewSession(
		context.Background(),
		transferID,
		models.TransferDirectionIncoming,
		req.FileName,
		req.FileSize,
		req.Checksum,
		req.SenderID,
		senderName,
	)
	session.SavePath = saveDir
	session.SetStatus(models.TransferStatusPreparing)
	s.sessions[transferID] = session
	s.mu.Unlock()

	// Send acceptance response via UDP to sender
	targetAddr := &net.UDPAddr{Port: 53317}
	if targetDevice != nil && targetDevice.IPAddress != "" {
		targetAddr.IP = net.ParseIP(targetDevice.IPAddress)
	} else if cachedAddr != nil && cachedAddr.IP != nil {
		targetAddr.IP = cachedAddr.IP
	}

	return s.sendTransferResponse(transferID, targetAddr, true, "", s.config.Port)
}

func (s *Service) RejectTransfer(transferID string, reason string) error {
	s.mu.Lock()
	req, ok := s.pending[transferID]
	if !ok {
		s.mu.Unlock()
		return fmt.Errorf("pending transfer request not found: %s", transferID)
	}
	cachedAddr := s.pendingAddrs[transferID]
	delete(s.pending, transferID)
	delete(s.pendingAddrs, transferID)
	s.mu.Unlock()

	targetAddr := &net.UDPAddr{Port: 53317}
	if targetDevice, ok := s.deviceService.Get(req.SenderID); ok && targetDevice.IPAddress != "" {
		targetAddr.IP = net.ParseIP(targetDevice.IPAddress)
	} else if cachedAddr != nil && cachedAddr.IP != nil {
		targetAddr.IP = cachedAddr.IP
	}

	return s.sendTransferResponse(transferID, targetAddr, false, reason, 0)
}

func (s *Service) sendTransferResponse(
	transferID string,
	targetAddr *net.UDPAddr,
	accepted bool,
	reason string,
	port int,
) error {
	respPacket := &models.TransferResponse{
		TransferID: transferID,
		ReceiverID: s.device.ID,
		Accepted:   accepted,
		Reason:     reason,
		Port:       port,
	}

	payload, err := transferprotocol.EncodeResponse(respPacket)
	if err != nil {
		return err
	}

	envelope := &packetprotocol.Envelope{
		Type:    packetprotocol.TypeTransferResponse,
		Payload: payload,
	}

	data, err := packetprotocol.Encode(envelope)
	if err != nil {
		return err
	}

	return s.udpSender.Send(data, targetAddr)
}

func (s *Service) CancelTransfer(transferID string) error {
	s.mu.RLock()
	session, ok := s.sessions[transferID]
	s.mu.RUnlock()

	if !ok {
		return fmt.Errorf("transfer session not found: %s", transferID)
	}

	session.Cancel()
	s.logger.Info("Transfer session cancelled by user", zap.String("transferId", transferID))
	return nil
}

func (s *Service) ListPending() []*models.TransferRequest {
	s.mu.RLock()
	defer s.mu.RUnlock()

	list := make([]*models.TransferRequest, 0, len(s.pending))
	for _, req := range s.pending {
		list = append(list, req)
	}
	return list
}

func (s *Service) ListTransfers() []*models.TransferProgress {
	s.mu.RLock()
	defer s.mu.RUnlock()

	list := make([]*models.TransferProgress, 0, len(s.sessions))
	for _, sess := range s.sessions {
		list = append(list, sess.ToProgress())
	}
	return list
}

func (s *Service) GetTransfer(transferID string) (*models.TransferProgress, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	sess, ok := s.sessions[transferID]
	if !ok {
		return nil, false
	}
	return sess.ToProgress(), true
}

func calculateFileSHA256(filePath string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	hasher := sha256.New()
	if _, err := io.Copy(hasher, file); err != nil {
		return "", err
	}

	return hex.EncodeToString(hasher.Sum(nil)), nil
}
