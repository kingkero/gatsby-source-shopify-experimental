import { CreateResolversArgs, CreateSchemaCustomizationArgs, NodePluginArgs, PluginOptionsSchemaArgs, SourceNodesArgs } from "gatsby";
export declare function pluginOptionsSchema({ Joi }: PluginOptionsSchemaArgs): import("gatsby-plugin-utils").ObjectSchema<any>;
export declare function sourceNodes(gatsbyApi: SourceNodesArgs, pluginOptions: ShopifyPluginOptions): Promise<void>;
export declare function createSchemaCustomization({ actions, }: CreateSchemaCustomizationArgs): void;
export declare function createResolvers({ createResolvers }: CreateResolversArgs, { downloadImages }: ShopifyPluginOptions): void;
export declare function onPreInit({ reporter }: NodePluginArgs): void;
