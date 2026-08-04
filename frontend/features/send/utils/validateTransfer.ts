import type { SendTransferState } from "../types/transfer";

export function validateTransfer(
    state: SendTransferState
): string[] {
    const errors: string[] = [];

    if (!state.selectedDevice) {
        errors.push("Please select a destination device.");
    }

    if (state.selectedDevice?.status === "offline") {
        errors.push("The selected device is offline.");
    }

    if (state.selectedItems.length === 0) {
        errors.push("Please select at least one file or folder.");
    }

    if (!state.options.destinationPath.trim()) {
        errors.push("Destination folder is required.");
    }

    return errors;
}