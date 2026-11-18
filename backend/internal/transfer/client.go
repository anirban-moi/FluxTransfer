package transfer

import (
	"bufio"
	"context"
	"encoding/binary"
	"fmt"
	"io"
	"net"
	"os"
	"strings"
	"time"

	"github.com/anirban-moi/FluxTransfer/backend/internal/logger"
	"github.com/anirban-moi/FluxTransfer/backend/internal/models"
	"go.uber.org/zap"
)

type Client struct {
	logger    *logger.Logger
	chunkSize int
	timeout   time.Duration
}

func NewClient(
	log *logger.Logger,
	chunkSize int,
	timeoutSeconds int,
) *Client {
	if chunkSize <= 0 {
		chunkSize = 1048576 // 1MB default
	}
	if timeoutSeconds <= 0 {
		timeoutSeconds = 30
	}

	return &Client{
		logger:    log,
		chunkSize: chunkSize,
		timeout:   time.Duration(timeoutSeconds) * time.Second,
	}
}

func (c *Client) StreamFile(
	ctx context.Context,
	session *Session,
	targetIP string,
	targetPort int,
) error {
	destAddr := fmt.Sprintf("%s:%d", targetIP, targetPort)
	c.logger.Info(
		"Dialing receiver for file streaming",
		zap.String("transferId", session.TransferID),
		zap.String("destination", destAddr),
	)

	dialer := net.Dialer{Timeout: c.timeout}
	conn, err := dialer.DialContext(ctx, "tcp4", destAddr)
	if err != nil {
		session.SetError(fmt.Errorf("failed to connect to receiver: %w", err))
		return err
	}
	defer conn.Close()

	// 1. Send Header: Magic(4) + Version(1) + TransferID(36)
	header := make([]byte, 4+1+36)
	copy(header[0:4], []byte(ProtocolMagic))
	header[4] = byte(ProtocolVersion)
	copy(header[5:41], []byte(session.TransferID))

	if _, err := conn.Write(header); err != nil {
		session.SetError(fmt.Errorf("failed to send stream header: %w", err))
		return err
	}

	// 2. Open Local File
	file, err := os.Open(session.FilePath)
	if err != nil {
		session.SetError(fmt.Errorf("failed to open source file: %w", err))
		return err
	}
	defer file.Close()

	session.SetStatus(models.TransferStatusRunning)
	buffer := make([]byte, c.chunkSize)
	var offset int64

	frameHeader := make([]byte, 8+4)

	for {
		select {
		case <-ctx.Done():
			session.SetStatus(models.TransferStatusCancelled)
			return ctx.Err()
		case <-session.Context().Done():
			session.SetStatus(models.TransferStatusCancelled)
			return fmt.Errorf("transfer cancelled by user")
		default:
		}

		n, err := file.Read(buffer)
		if n > 0 {
			// Write Frame Header: offset (8) + length (4)
			binary.BigEndian.PutUint64(frameHeader[0:8], uint64(offset))
			binary.BigEndian.PutUint32(frameHeader[8:12], uint32(n))

			if _, err := conn.Write(frameHeader); err != nil {
				session.SetError(fmt.Errorf("failed to send frame header: %w", err))
				return err
			}

			if _, err := conn.Write(buffer[:n]); err != nil {
				session.SetError(fmt.Errorf("failed to send chunk payload: %w", err))
				return err
			}

			offset += int64(n)
			session.UpdateProgress(offset)
		}

		if err != nil {
			if err == io.EOF {
				break
			}
			session.SetError(fmt.Errorf("read file error: %w", err))
			return err
		}
	}

	// 3. Send EOF frame: length = 0
	binary.BigEndian.PutUint64(frameHeader[0:8], uint64(offset))
	binary.BigEndian.PutUint32(frameHeader[8:12], 0)
	if _, err := conn.Write(frameHeader); err != nil {
		session.SetError(fmt.Errorf("failed to send EOF frame: %w", err))
		return err
	}

	// 4. Read Server Response
	session.SetStatus(models.TransferStatusVerifying)
	reader := bufio.NewReader(conn)
	respLine, err := reader.ReadString('\n')
	if err != nil {
		session.SetError(fmt.Errorf("failed to read completion status from receiver: %w", err))
		return err
	}

	respLine = strings.TrimSpace(respLine)
	if respLine != "OK" {
		err := fmt.Errorf("receiver returned error: %s", respLine)
		session.SetError(err)
		return err
	}

	session.SetStatus(models.TransferStatusCompleted)
	c.logger.Info(
		"Outgoing file stream verified and completed successfully",
		zap.String("transferId", session.TransferID),
		zap.Int64("bytesSent", offset),
	)

	return nil
}
