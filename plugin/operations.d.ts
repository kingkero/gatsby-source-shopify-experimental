import { NodeInput, SourceNodesArgs } from "gatsby";
interface UserError {
    field: string[];
    message: string;
}
export interface BulkOperationRunQueryResponse {
    bulkOperationRunQuery: {
        userErrors: UserError[];
        bulkOperation: BulkOperationNode;
    };
}
export interface BulkOperationCancelResponse {
    bulkOperation: BulkOperationNode;
    userErrors: UserError[];
}
export interface ShopifyBulkOperation {
    execute: () => Promise<BulkOperationRunQueryResponse>;
    name: string;
    process: (objects: BulkResults, nodeBuilder: NodeBuilder, gatsbyApi: SourceNodesArgs) => Promise<NodeInput>[];
}
export declare function createOperations(options: ShopifyPluginOptions, { reporter }: SourceNodesArgs): {
    incrementalProducts(date: Date): ShopifyBulkOperation;
    incrementalOrders(date: Date): ShopifyBulkOperation;
    incrementalCollections(date: Date): ShopifyBulkOperation;
    createProductsOperation: ShopifyBulkOperation;
    createOrdersOperation: ShopifyBulkOperation;
    createCollectionsOperation: ShopifyBulkOperation;
    cancelOperationInProgress: () => Promise<void>;
    cancelOperation: (id: string) => Promise<BulkOperationCancelResponse>;
    finishLastOperation: () => Promise<void>;
    completedOperation: (operationId: string, interval?: number) => Promise<{
        node: BulkOperationNode;
    }>;
};
export {};
