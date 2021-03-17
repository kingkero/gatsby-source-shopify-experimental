"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationError = exports.pluginErrorCodes = void 0;
exports.pluginErrorCodes = {
    bulkOperationFailed: "111000",
    unknownSourcingFailure: "111001",
};
class OperationError extends Error {
    constructor(node) {
        const { errorCode, id } = node;
        super(`Operation ${id} failed with ${errorCode}`);
        Object.setPrototypeOf(this, OperationError.prototype);
        this.node = node;
    }
}
exports.OperationError = OperationError;
//# sourceMappingURL=errors.js.map