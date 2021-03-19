"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onPreInit = exports.createResolvers = exports.createSchemaCustomization = exports.sourceNodes = exports.pluginOptionsSchema = void 0;
const operations_1 = require("./operations");
const events_1 = require("./events");
const graphql_utils_1 = require("gatsby-plugin-image/graphql-utils");
const resolve_gatsby_image_data_1 = require("./resolve-gatsby-image-data");
const errors_1 = require("./errors");
const constants_1 = require("./constants");
const make_source_from_operation_1 = require("./make-source-from-operation");
function pluginOptionsSchema({ Joi }) {
    return Joi.object({
        apiKey: Joi.string().required(),
        password: Joi.string().required(),
        storeUrl: Joi.string().required(),
        downloadImages: Joi.boolean(),
        verboseLogging: Joi.boolean(),
        shopifyConnections: Joi.array()
            .default([])
            .items(Joi.string().valid("orders", "collections")),
    });
}
exports.pluginOptionsSchema = pluginOptionsSchema;
async function sourceAllNodes(gatsbyApi, pluginOptions) {
    var _a, _b;
    const { createProductsOperation, createOrdersOperation, createCollectionsOperation, finishLastOperation, completedOperation, cancelOperationInProgress, } = operations_1.createOperations(pluginOptions, gatsbyApi);
    const operations = [createProductsOperation];
    if ((_a = pluginOptions.shopifyConnections) === null || _a === void 0 ? void 0 : _a.includes("orders")) {
        operations.push(createOrdersOperation);
    }
    if ((_b = pluginOptions.shopifyConnections) === null || _b === void 0 ? void 0 : _b.includes("collections")) {
        operations.push(createCollectionsOperation);
    }
    const sourceFromOperation = make_source_from_operation_1.makeSourceFromOperation(finishLastOperation, completedOperation, cancelOperationInProgress, gatsbyApi, pluginOptions);
    for (const op of operations) {
        await sourceFromOperation(op);
    }
}
const shopifyNodeTypes = [
    `ShopifyLineItem`,
    `ShopifyMetafield`,
    `ShopifyOrder`,
    `ShopifyProduct`,
    `ShopifyCollection`,
    `ShopifyProductImage`,
    `ShopifyCollectionImage`,
    `ShopifyProductFeaturedImage`,
    `ShopifyProductVariant`,
    `ShopifyProductVariantImage`,
    `ShopifyProductVariantPricePair`,
];
async function sourceChangedNodes(gatsbyApi, pluginOptions) {
    var _a, _b, _c, _d;
    const { incrementalProducts, incrementalOrders, incrementalCollections, finishLastOperation, completedOperation, cancelOperationInProgress, } = operations_1.createOperations(pluginOptions, gatsbyApi);
    const lastBuildTime = new Date((_b = (_a = gatsbyApi.store.getState().status.plugins) === null || _a === void 0 ? void 0 : _a[`gatsby-source-shopify-experimental-cachebust`]) === null || _b === void 0 ? void 0 : _b.lastBuildTime);
    for (const nodeType of shopifyNodeTypes) {
        gatsbyApi
            .getNodesByType(nodeType)
            .forEach((node) => gatsbyApi.actions.touchNode(node));
    }
    const operations = [incrementalProducts(lastBuildTime)];
    if ((_c = pluginOptions.shopifyConnections) === null || _c === void 0 ? void 0 : _c.includes("orders")) {
        operations.push(incrementalOrders(lastBuildTime));
    }
    if ((_d = pluginOptions.shopifyConnections) === null || _d === void 0 ? void 0 : _d.includes("collections")) {
        operations.push(incrementalCollections(lastBuildTime));
    }
    const sourceFromOperation = make_source_from_operation_1.makeSourceFromOperation(finishLastOperation, completedOperation, cancelOperationInProgress, gatsbyApi, pluginOptions);
    for (const op of operations) {
        await sourceFromOperation(op);
    }
    const { fetchDestroyEventsSince } = events_1.eventsApi(pluginOptions);
    const destroyEvents = await fetchDestroyEventsSince(lastBuildTime);
    gatsbyApi.reporter.info(`${destroyEvents.length} items have been deleted since ${lastBuildTime}`);
    if (destroyEvents.length) {
        gatsbyApi.reporter.info(`Removing matching nodes from Gatsby`);
        destroyEvents.forEach((e) => {
            const id = `gid://shopify/${e.subject_type}/${e.subject_id}`;
            gatsbyApi.reporter.info(`Looking up node with ID: ${id}`);
            const nodeId = gatsbyApi.createNodeId(id);
            const node = gatsbyApi.getNode(nodeId);
            if (node) {
                gatsbyApi.reporter.info(`Removing ${node.internal.type}: ${node.id} with shopifyId ${e.subject_id}`);
                gatsbyApi.actions.deleteNode(node);
            }
            else {
                gatsbyApi.reporter.info(`Couldn't find node with ID: ${id}`);
            }
        });
    }
}
async function sourceNodes(gatsbyApi, pluginOptions) {
    var _a, _b;
    const lastOperationId = await gatsbyApi.cache.get(constants_1.LAST_SHOPIFY_BULK_OPERATION);
    if (lastOperationId) {
        gatsbyApi.reporter.info(`Cancelling last operation: ${lastOperationId}`);
        await operations_1.createOperations(pluginOptions, gatsbyApi).cancelOperation(lastOperationId);
        await gatsbyApi.cache.set(constants_1.LAST_SHOPIFY_BULK_OPERATION, undefined);
    }
    const lastBuildTime = (_b = (_a = gatsbyApi.store.getState().status.plugins) === null || _a === void 0 ? void 0 : _a[`gatsby-source-shopify-experimental-cachebust`]) === null || _b === void 0 ? void 0 : _b.lastBuildTime;
    if (lastBuildTime) {
        gatsbyApi.reporter.info(`Cache is warm, running an incremental build`);
        await sourceChangedNodes(gatsbyApi, pluginOptions);
    }
    else {
        gatsbyApi.reporter.info(`Cache is cold, running a clean build`);
        await sourceAllNodes(gatsbyApi, pluginOptions);
    }
    gatsbyApi.reporter.info(`Finished sourcing nodes, caching last build time`);
    gatsbyApi.actions.setPluginStatus({ lastBuildTime: Date.now() });
}
exports.sourceNodes = sourceNodes;
function createSchemaCustomization({ actions, }) {
    actions.createTypes(`
    type ShopifyProductVariant implements Node {
      product: ShopifyProduct @link(from: "productId", by: "id")
      metafields: [ShopifyMetafield] @link(from: "id", by: "productVariantId")
    }

    type ShopifyProductVariantImage {
      localFile: File @link
    }

    type ShopifyProduct implements Node {
      variants: [ShopifyProductVariant] @link(from: "id", by: "productId")
      images: [ShopifyProductImage] @link(from: "id", by: "productId")
      collections: [ShopifyCollection] @link(from: "id", by: "productIds")
    }

    type ShopifyCollection implements Node {
      products: [ShopifyProduct] @link(from: "productIds", by: "id")
      metafields: [ShopifyMetafield] @link(from: "id", by: "collectionId")
    }

    type ShopifyProductFeaturedImage {
      localFile: File @link
    }

    type ShopifyCollectionImage {
      localFile: File @link
    }

    type ShopifyMetafield implements Node {
      productVariant: ShopifyProductVariant @link(from: "productVariantId", by: "id")
      collection: ShopifyCollection @link(from: "collectionId", by: "id")
    }

    type ShopifyOrder implements Node {
      lineItems: [ShopifyLineItem] @link(from: "id", by: "orderId")
    }

    type ShopifyLineItem implements Node {
      product: ShopifyProduct @link(from: "productId", by: "id")
      order: ShopifyOrder @link(from: "orderId", by: "id")
    }

    type ShopifyProductImage implements Node {
      altText: String
      originalSrc: String!
      product: ShopifyProduct @link(from: "productId", by: "id")
      localFile: File @link
    }
  `);
}
exports.createSchemaCustomization = createSchemaCustomization;
function createResolvers({ createResolvers }, { downloadImages }) {
    if (!downloadImages) {
        const resolvers = {
            ShopifyProductImage: {
                gatsbyImageData: graphql_utils_1.getGatsbyImageResolver(resolve_gatsby_image_data_1.resolveGatsbyImageData),
            },
            ShopifyProductFeaturedImage: {
                gatsbyImageData: graphql_utils_1.getGatsbyImageResolver(resolve_gatsby_image_data_1.resolveGatsbyImageData),
            },
            ShopifyCollectionImage: {
                gatsbyImageData: graphql_utils_1.getGatsbyImageResolver(resolve_gatsby_image_data_1.resolveGatsbyImageData),
            },
            ShopifyProductVariantImage: {
                gatsbyImageData: graphql_utils_1.getGatsbyImageResolver(resolve_gatsby_image_data_1.resolveGatsbyImageData),
            },
        };
        createResolvers(resolvers);
    }
}
exports.createResolvers = createResolvers;
const getErrorText = (context) => context.sourceMessage;
function onPreInit({ reporter }) {
    reporter.setErrorMap({
        [errors_1.pluginErrorCodes.bulkOperationFailed]: {
            text: getErrorText,
            level: `ERROR`,
            category: `USER`,
        },
        /**
         * If we don't know what it is, we haven't done our due
         * diligence to handle it explicitly. That means it's our
         * fault, so THIRD_PARTY indicates us, the plugin authors.
         */
        [errors_1.pluginErrorCodes.unknownSourcingFailure]: {
            text: getErrorText,
            level: "ERROR",
            category: `THIRD_PARTY`,
        },
    });
}
exports.onPreInit = onPreInit;
//# sourceMappingURL=gatsby-node.js.map
