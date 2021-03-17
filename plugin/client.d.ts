export declare function createClient(options: ShopifyPluginOptions): {
    request: <T>(query: string, variables?: Record<string, any> | undefined, retries?: number) => Promise<T>;
};
