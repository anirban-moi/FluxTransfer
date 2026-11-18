package transfer

import (
	"context"
	"encoding/binary"
	"fmt"
	"io"
	"net"
	"os"
	"path/filepath"
	"strings"

	"github.com/anirban-moi/FluxTransfer/backend/internal/logger"
	"github.com/anirban-moi/FluxTransfer/backend/internal/models"
	"go.uber.org/zap"
)

const (
	ProtocolMagic   = "FLUX"
	ProtocolVersion = 1
)

type Server struct {
	logger   *logger.Logger
	port     int
	listener net.Listener
	service  *Service
}

func NewServer(
	log *logger.Logger,
	port int,
	service *Service,
) *Server {
	return &Server{
		logger:  log,
		port:    port,
		service: service,
	}
}

func (s *Server) Start(ctx context.Context) error {
	addr := fmt.Sprintf(":%d", s.port)
	listener, err := net.Listen("tcp4", addr)
	if err != nil {
		return fmt.Errorf("failed to bind TCP transfer server on %s: %w", addr, err)
	}

	s.listener = listener
	s.logger.Info(
		"TCP Transfer server listening",
		zap.Int("port", s.port),
	)

	go func() {
		for {
			conn, err := s.listener.Accept()
			if err != nil {
				select {
				case <-ctx.Done():
					return
				default:
					s.logger.Debug("TCP accept error", zap.Error(err))
					return
				}
			}

			go s.handleConnection(ctx, conn)
		}
	}()

	return nil
}

func (s *Server) Shutdown(ctx context.Context) error {
	if s.listener != nil {
		s.logger.Info("TCP Transfer server shutting down")
		return s.listener.Close()
	}
	return nil
}

func (s *Server) handleConnection(ctx context.Context, conn net.Conn) {
	defer conn.Close()

	remoteAddr := conn.RemoteAddr().String()
	s.logger.Info("Incoming TCP transfer connection", zap.String("remoteAddr", remoteAddr))

	// 1. Read Protocol Header: Magic(4) + Version(1) + TransferID(36)
	headerBuf := make([]byte, 4+1+36)
	if _, err := io.ReadFull(conn, headerBuf); err != nil {
		s.logger.Error("Failed to read transfer stream header", zap.Error(err))
		return
	}

	magic := string(headerBuf[0:4])
	if magic != ProtocolMagic {
		s.logger.Error("Invalid protocol magic in transfer stream", zap.String("magic", magic))
		return
	}

	version := headerBuf[4]
	if version != ProtocolVersion {
		s.logger.Error("Unsupported protocol version", zap.Uint8("version", version))
		return
	}

	transferID := string(headerBuf[5:41])
	session, ok := s.service.GetSession(transferID)
	if !ok {
		s.logger.Error("Transfer session not found", zap.String("transferId", transferID))
		_, _ = conn.Write([]byte("ERR:SESSION_NOT_FOUND\n"))
		return
	}

	session.SetStatus(models.TransferStatusRunning)
	s.logger.Info(
		"Starting file data reception",
		zap.String("transferId", transferID),
		zap.String("fileName", session.FileName),
		zap.Int64("fileSize", session.FileSize),
	)

	// Ensure destination directory exists
	saveDir := session.SavePath
	if saveDir == "" {
		saveDir = s.service.config.SaveDir
	}
	if err := os.MkdirAll(saveDir, 0755); err != nil {
		session.SetError(fmt.Errorf("failed to create save directory: %w", err))
		_, _ = conn.Write([]byte("ERR:DIR_CREATION_FAILED\n"))
		return
	}

	finalFilePath := filepath.Join(saveDir, session.FileName)
	tempFilePath := finalFilePath + ".flux.tmp"

	tempFile, err := os.OpenFile(tempFilePath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0644)
	if err != nil {
		session.SetError(fmt.Errorf("failed to create temporary file: %w", err))
		_, _ = conn.Write([]byte("ERR:FILE_CREATION_FAILED\n"))
		return
	}
	defer func() {
		_ = tempFile.Close()
	}()

	var totalReceived int64
	frameHeader := make([]byte, 8+4) // 8-byte offset + 4-byte length

	for {
		select {
		case <-session.Context().Done():
			session.SetStatus(models.TransferStatusCancelled)
			_ = os.Remove(tempFilePath)
			_, _ = conn.Write([]byte("ERR:CANCELLED\n"))
			return
		default:
		}

		if _, err := io.ReadFull(conn, frameHeader); err != nil {
			if err == io.EOF {
				break
			}
			session.SetError(fmt.Errorf("read chunk frame header failed: %w", err))
			_ = os.Remove(tempFilePath)
			_, _ = conn.Write([]byte("ERR:STREAM_ERROR\n"))
			return
		}

		offset := binary.BigEndian.Uint64(frameHeader[0:8])
		chunkLen := binary.BigEndian.Uint32(frameHeader[8:12])

		// End of stream signal
		if chunkLen == 0 {
			break
		}

		chunkBuffer := make([]byte, chunkLen)
		if _, err := io.ReadFull(conn, chunkBuffer); err != nil {
			session.SetError(fmt.Errorf("read chunk payload failed: %w", err))
			_ = os.Remove(tempFilePath)
			_, _ = conn.Write([]byte("ERR:PAYLOAD_ERROR\n"))
			return
		}

		if _, err := tempFile.WriteAt(chunkBuffer, int64(offset)); err != nil {
			session.SetError(fmt.Errorf("write chunk to disk failed: %w", err))
			_ = os.Remove(tempFilePath)
			_, _ = conn.Write([]byte("ERR:DISK_WRITE_FAILED\n"))
			return
		}

		session.WriteToHasher(chunkBuffer)
		totalReceived += int64(chunkLen)
		session.UpdateProgress(totalReceived)
	}

	_ = tempFile.Close()

	// 2. Integrity Verification
	session.SetStatus(models.TransferStatusVerifying)
	calculatedHash := session.CalculatedChecksum()
	if session.Checksum != "" && !strings.EqualFold(calculatedHash, session.Checksum) {
		err := fmt.Errorf("checksum mismatch: expected %s, got %s", session.Checksum, calculatedHash)
		s.logger.Error("File integrity verification failed", zap.Error(err))
		session.SetError(err)
		_ = os.Remove(tempFilePath)
		_, _ = conn.Write([]byte("ERR:CHECKSUM_MISMATCH\n"))
		return
	}

	// 3. Finalize Atomic File Move
	if err := os.Rename(tempFilePath, finalFilePath); err != nil {
		session.SetError(fmt.Errorf("failed to finalize received file: %w", err))
		_, _ = conn.Write([]byte("ERR:FINALIZE_FAILED\n"))
		return
	}

	session.SetStatus(models.TransferStatusCompleted)
	_, _ = conn.Write([]byte("OK\n"))

	s.logger.Info(
		"File transfer completed successfully",
		zap.String("transferId", transferID),
		zap.String("savedTo", finalFilePath),
		zap.Int64("bytes", totalReceived),
	)
}
