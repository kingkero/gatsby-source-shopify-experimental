"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectionsProcessor = void 0;
const node_builder_1 = require("./node-builder");
function collectionsProcessor(objects, builder, gatsbyApi) {
    const promises = [];
    for (let i = objects.length - 1; i >= 0; i--) {
        const result = objects[i];
        const [fullId, remoteType] = result.id.match(node_builder_1.pattern) || [];
        if (remoteType === `Product`) {
            const productIds = [fullId];
            let j = i - 1;
            while (objects[j].id !== result.__parentId) {
                const [siblingId, siblingRemoteType] = objects[j].id.match(node_builder_1.pattern) || [];
                /**
                 * TODO: assert that the sibling type is a product.
                 *
                 * We don't currently request any other connection data
                 * from collections, so according to the docs, it should be
                 * products all the way up until we get to the parent collection.
                 */
                if (siblingRemoteType === `Product`) {
                    productIds.push(gatsbyApi.createNodeId(siblingId));
                }
                j--;
            }
            /**
             * TODO: assert j > 0 and objects[j] is our collection node
             */
            const collection = objects[j];
            collection.productIds = productIds;
            promises.push(builder.buildNode(collection));
            const nextSlice = objects.slice(0, j);
            return promises.concat(collectionsProcessor(nextSlice, builder, gatsbyApi));
        }
        else {
            promises.push(builder.buildNode(result));
        }
    }
    return promises;
}
exports.collectionsProcessor = collectionsProcessor;
//# sourceMappingURL=processors.js.map