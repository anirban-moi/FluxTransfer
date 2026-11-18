import type { SendTransferState } from "../types/transfer";

export function validateTransfer(
    state: SendTransferState
): string[] {
    const errors: string[] = [];

    if (!state.selectedDevice) {
        errors.push("Please select a destination device.");
    } else {
        if (state.selectedDevice.status === "offline") {
            errors.push("The selected device is offline.");
        }

        const isPaired =
            state.selectedDevice.pairingStatus === "paired" ||
            Boolean(state.selectedDevice.isTrusted);

        if (!isPaired) {
            errors.push("The selected device is not paired. Please pair devices before transferring.");
        }
    }

    if (state.selectedItems.length === 0) {
        errors.push("Please select at least one file to transfer.");
    }

    return errors;
}