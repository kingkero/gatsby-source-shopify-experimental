import { SourceNodesArgs } from "gatsby";
import { ShopifyBulkOperation } from "./operations";
export declare function makeSourceFromOperation(finishLastOperation: () => Promise<void>, completedOperation: (id: string) => Promise<{
    node: BulkOperationNode;
}>, cancelOperationInProgress: () => Promise<void>, gatsbyApi: SourceNodesArgs, options: ShopifyPluginOptions): (op: ShopifyBulkOperation) => Promise<void>;
