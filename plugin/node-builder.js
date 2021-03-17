"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeBuilder = exports.processorMap = exports.pattern = void 0;
const gatsby_source_filesystem_1 = require("gatsby-source-filesystem");
// 'gid://shopify/Metafield/6936247730264'
exports.pattern = /^gid:\/\/shopify\/(\w+)\/(.+)$/;
function attachParentId(obj, gatsbyApi) {
    if (obj.__parentId) {
        const [fullId, remoteType] = obj.__parentId.match(exports.pattern) || [];
        const field = remoteType.charAt(0).toLowerCase() + remoteType.slice(1);
        const idField = `${field}Id`;
        obj[idField] = gatsbyApi.createNodeId(fullId);
        delete obj.__parentId;
    }
}
const downloadImageAndCreateFileNode = async ({ url, nodeId }, { actions: { createNode }, createNodeId, cache, store, reporter, }) => {
    const fileNode = await gatsby_source_filesystem_1.createRemoteFileNode({
        url,
        cache,
        createNode,
        createNodeId,
        parentNodeId: nodeId,
        store,
        reporter,
    });
    return fileNode.id;
};
async function processChildImage(node, childKey, gatsbyApi, options) {
    if (options.downloadImages) {
        const image = node[childKey];
        if (image) {
            const url = image.originalSrc;
            const fileNodeId = await downloadImageAndCreateFileNode({
                url,
                nodeId: node.id,
            }, gatsbyApi);
            image.localFile = fileNodeId;
        }
    }
}
exports.processorMap = {
    LineItem: async (node, gatsbyApi) => {
        const lineItem = node;
        if (lineItem.product) {
            lineItem.productId = gatsbyApi.createNodeId(lineItem.product.id);
            delete lineItem.product;
        }
    },
    ProductImage: async (node, gatsbyApi, options) => {
        if (options.downloadImages) {
            const url = node.originalSrc;
            const fileNodeId = await downloadImageAndCreateFileNode({
                url,
                nodeId: node.id,
            }, gatsbyApi);
            node.localFile = fileNodeId;
        }
    },
    Collection: async (node, gatsbyApi, options) => {
        return processChildImage(node, "image", gatsbyApi, options);
    },
    Product: async (node, gatsbyApi, options) => {
        return processChildImage(node, "featuredImage", gatsbyApi, options);
    },
    ProductVariant: async (node, gatsbyApi, options) => {
        return processChildImage(node, "image", gatsbyApi, options);
    },
};
function nodeBuilder(gatsbyApi, options) {
    return {
        async buildNode(result) {
            if (!exports.pattern.test(result.id)) {
                throw new Error(`Expected an ID in the format gid://shopify/<typename>/<id>`);
            }
            const [, remoteType] = result.id.match(exports.pattern) || [];
            const processor = exports.processorMap[remoteType] || (() => Promise.resolve());
            attachParentId(result, gatsbyApi);
            const node = Object.assign(Object.assign({}, result), { shopifyId: result.id, id: gatsbyApi.createNodeId(result.id), internal: {
                    type: `Shopify${remoteType}`,
                    contentDigest: gatsbyApi.createContentDigest(result),
                } });
            await processor(node, gatsbyApi, options);
            return node;
        },
    };
}
exports.nodeBuilder = nodeBuilder;
//# sourceMappingURL=node-builder.js.map