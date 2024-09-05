"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_CODE = exports.ERROR_MESSAGE = void 0;
exports.ERROR_MESSAGE = {
    NO_SIGNATURE: "No signature.",
    NO_DATA: "No data.",
    INVALID_SIGNATURE: "Invalid signature.",
    DATA_NOT_INTEGRITY: "The data is unreliable because the signature of the response does not match the signature of the data",
    WEBHOOK_URL_INVALID: "Webhook URL invalid.",
    UNAUTHORIZED: "Unauthorized.",
    INTERNAL_SERVER_ERROR: "Internal Server Error.",
    INVALID_PARAMETER: "Invalid Parameter."
};
exports.ERROR_CODE = {
    INTERNAL_SERVER_ERROR: "20",
    UNAUTHORIZED: "401"
};
