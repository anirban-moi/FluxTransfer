import type { ReceiveTransferState } from "../types/transfer";

export function validateReceive(
    state: ReceiveTransferState
): string[] {
    const errors: string[] = [];

    const status = state.progress.status;

    if (!state.incomingTransfer) {
        errors.push("No incoming transfer request.");
    }

    if (status === "rejected") {
        errors.push("The incoming transfer has been rejected.");
    }

    if (status === "cancelled") {
        errors.push("The receive operation has been cancelled.");
    }

    if (status === "completed") {
        errors.push("The receive operation has already completed.");
    }

    if (!state.options.saveLocation.trim()) {
        errors.push("Please select a destination folder.");
    }

    return errors;
}