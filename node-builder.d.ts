import { NodeInput, SourceNodesArgs } from "gatsby";
export declare const pattern: RegExp;
interface ProcessorMap {
    [remoteType: string]: (node: NodeInput, gatsbyApi: SourceNodesArgs, options: ShopifyPluginOptions) => Promise<void>;
}
export declare const processorMap: ProcessorMap;
export declare function nodeBuilder(gatsbyApi: SourceNodesArgs, options: ShopifyPluginOptions): NodeBuilder;
export {};
