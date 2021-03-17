"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOperations = void 0;
const client_1 = require("./client");
const processors_1 = require("./processors");
const errors_1 = require("./errors");
const queries_1 = require("./queries");
const finishedStatuses = [`COMPLETED`, `FAILED`, `CANCELED`, `EXPIRED`];
function defaultProcessor(objects, builder) {
    return objects.map(builder.buildNode);
}
function createOperations(options, { reporter }) {
    const client = client_1.createClient(options);
    function currentOperation() {
        return client.request(queries_1.OPERATION_STATUS_QUERY);
    }
    function createOperation(operationQuery, name, process) {
        return {
            execute: () => client.request(operationQuery),
            name,
            process: process || defaultProcessor,
        };
    }
    async function finishLastOperation() {
        let { currentBulkOperation } = await currentOperation();
        if (currentBulkOperation && currentBulkOperation.id) {
            const timer = reporter.activityTimer(`Waiting for operation ${currentBulkOperation.id} : ${currentBulkOperation.status}`);
            timer.start();
            while (!finishedStatuses.includes(currentBulkOperation.status)) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                currentBulkOperation = (await currentOperation()).currentBulkOperation;
                if (options.verboseLogging) {
                    reporter.verbose(`Polling operation ${currentBulkOperation.id} : ${currentBulkOperation.status}`);
                }
            }
            timer.end();
        }
    }
    async function cancelOperation(id) {
        return client.request(queries_1.CANCEL_OPERATION, {
            id,
        });
    }
    async function cancelOperationInProgress() {
        let { currentBulkOperation: bulkOperation } = await currentOperation();
        if (!bulkOperation) {
            return;
        }
        if (bulkOperation.status === `RUNNING`) {
            reporter.info(`Canceling a currently running operation: ${bulkOperation.id}`);
            bulkOperation = (await cancelOperation(bulkOperation.id)).bulkOperation;
            while (bulkOperation.status !== `CANCELED`) {
                await new Promise((resolve) => setTimeout(resolve, 100));
                bulkOperation = (await currentOperation()).currentBulkOperation;
            }
        }
        else {
            /**
             * Just because it's not running doesn't mean it's done. For
             * example, it could be CANCELING. We still have to wait for it
             * to be officially finished before we start a new one.
             */
            while (!finishedStatuses.includes(bulkOperation.status)) {
                await new Promise((resolve) => setTimeout(resolve, 100));
                bulkOperation = (await currentOperation()).currentBulkOperation;
            }
        }
    }
    /* Maybe the interval should be adjustable, because users
     * with larger data sets could easily wait longer. We could
     * perhaps detect that the interval being used is too small
     * based on returned object counts and iteration counts, and
     * surface feedback to the user suggesting that they increase
     * the interval.
     */
    async function completedOperation(operationId, interval = 1000) {
        const operation = await client.request(queries_1.OPERATION_BY_ID, {
            id: operationId,
        });
        if (options.verboseLogging) {
            reporter.verbose(`
        Waiting for operation to complete

        ${operationId}

        Status: ${operation.node.status}

        Object count: ${operation.node.objectCount}

        Url: ${operation.node.url}
      `);
        }
        if (operation.node.status === "FAILED") {
            throw new errors_1.OperationError(operation.node);
        }
        if (operation.node.status === "COMPLETED") {
            return operation;
        }
        await new Promise((resolve) => setTimeout(resolve, interval));
        return completedOperation(operationId, interval);
    }
    return {
        incrementalProducts(date) {
            return createOperation(queries_1.incrementalProductsQuery(date), "INCREMENTAL_PRODUCTS");
        },
        incrementalOrders(date) {
            return createOperation(queries_1.incrementalOrdersQuery(date), "INCREMENTAL_ORDERS");
        },
        incrementalCollections(date) {
            return createOperation(queries_1.incrementalCollectionsQuery(date), "INCREMENTAL_COLLECTIONS", processors_1.collectionsProcessor);
        },
        createProductsOperation: createOperation(queries_1.CREATE_PRODUCTS_OPERATION, "PRODUCTS"),
        createOrdersOperation: createOperation(queries_1.CREATE_ORDERS_OPERATION, "ORDERS"),
        createCollectionsOperation: createOperation(queries_1.CREATE_COLLECTIONS_OPERATION, "COLLECTIONS", processors_1.collectionsProcessor),
        cancelOperationInProgress,
        cancelOperation,
        finishLastOperation,
        completedOperation,
    };
}
exports.createOperations = createOperations;
//# sourceMappingURL=operations.js.map