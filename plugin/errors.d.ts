export declare const pluginErrorCodes: {
    bulkOperationFailed: string;
    unknownSourcingFailure: string;
};
export declare class OperationError extends Error {
    node: BulkOperationNode;
    constructor(node: BulkOperationNode);
}
