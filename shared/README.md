# Shared

The `shared` directory contains platform-wide contracts, models, protocol definitions, and constants used by multiple FluxTransfer subsystems.

The purpose of this directory is to provide a common language across the platform while remaining free of implementation-specific logic.

## Responsibilities

- Shared contracts
- Shared models
- Protocol definitions
- Platform constants

## Non-Responsibilities

This directory must not contain:

- Business logic
- Transfer algorithms
- UI components
- Backend services
- Engine implementations
- Database code

Shared definitions should remain implementation-independent and reusable across the platform.