import axios from 'axios';
import BigNumber from 'bignumber.js';
import jsonBigint from 'json-bigint';

// Set useNativeBigInt to true and use BigInt once BigInt is widely supported.
const JSONbig = jsonBigint({ strict: true, useNativeBigInt: true });

// eslint-disable-next-line no-unused-vars
enum RosettaErrorType {
    // eslint-disable-next-line no-unused-vars
    NotFound,
    // eslint-disable-next-line no-unused-vars
    Timeout,
    // eslint-disable-next-line no-unused-vars
    NetworkError,
}

/**
 * Describes the cause of a Rosetta API error.
 */
class RosettaError extends Error {
    public errorType: RosettaErrorType;

    constructor(message: any, status: any) {
        super(message);
        switch (status) {
            case 408:
                this.errorType = RosettaErrorType.Timeout;
                break;
            case 500:
                this.errorType = RosettaErrorType.NotFound;
                break;
            default:
                this.errorType = RosettaErrorType.NetworkError;
                break;
        }
    }
}

/**
 * Contains information about a transaction.
 */
class Transaction {
    public blockIndex: number;
    public hash: string;
    public timestamp: Date;
    public type: string;
    public status: string;
    public account1Address: string;
    public account2Address: string;
    public amount: BigNumber;
    public fee: BigNumber;
    public memo: BigNumber;

    /**
     * Create a Transaction.
     * @param {Any} rosettaTransaction The Rosetta Transaction object of the transaction.
     * @param {Number} blockIndex The index of the block containing the transaction.
     * milliseconds since the Unix Epoch.
     */
    constructor(rosettaTransaction: any, blockIndex: number) {
        this.blockIndex = blockIndex;
        this.hash = rosettaTransaction.transaction_identifier.hash;
        const timestampMs = Number(rosettaTransaction.metadata.timestamp / BigInt(1000000));
        this.timestamp = new Date(timestampMs);
        const operations = rosettaTransaction.operations;
        if (operations.length >= 1) {
            this.type = operations[0].type;
            this.status = operations[0].status;
            this.account1Address = operations[0].account.address;
            this.amount = new BigNumber(operations[0].amount.value);
            // Negate amount for TRANSACTION and BURN, so that they appear in the UI as positive values.
            if (
                (operations[0].type === 'TRANSACTION' || operations[0].type === 'BURN') &&
                !this.amount.isZero()
            ) {
                this.amount = this.amount.negated();
            }
        } else {
            this.type = '';
            this.status = '';
            this.account1Address = '';
            this.amount = new BigNumber(0);
        }
        if (operations.length >= 2 && operations[1].type === 'TRANSACTION')
            this.account2Address = operations[1].account.address;
        else this.account2Address = '';
        if (operations.length >= 3 && operations[2].type === 'FEE')
            this.fee = new BigNumber(-operations[2].amount.value);
        else this.fee = new BigNumber(0);
        this.memo = new BigNumber(rosettaTransaction.metadata.memo);
    }
}

/**
 * Manages Rosetta API calls.
 */
export default class RosettaApi {
    private axiosInstance = axios.create({
        baseURL: 'https://rosetta-api.internetcomputer.org/',
        method: 'post',
        transformRequest: (data: any) => JSONbig.stringify(data),
        transformResponse: (data: any) => JSONbig.parse(data),
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
    });

    private networkIdentifier: Promise<any>;

    constructor() {
        this.networkIdentifier = this.networksList().then((res) =>
            res.network_identifiers.find(
                (networkIdentifier: any) => networkIdentifier.blockchain === 'Internet Computer',
            ),
        );
    }

    /**
     * Return the ICP account balance of the specified account.
     * @param {string} accountAddress The account address to get the ICP balance of.
     * @returns {Promise<BigNumber|RosettaError>} The ICP account balance of the specified account, or
     * a RosettaError for error.
     */
    async getAccountBalance(accountAddress: string): Promise<BigNumber | RosettaError> {
        try {
            const response = await this.accountBalanceByAddress(accountAddress);
            return new BigNumber(response.balances[0].value);
        } catch (error: any) {
            return new RosettaError(
                error.message,
                axios.isAxiosError(error) ? error?.response?.status : undefined,
            );
        }
    }

    /**
     * Return the latest block index.
     * @returns {Promise<number>} The latest block index, or a RosettaError for error.
     */
    async getLastBlockIndex(): Promise<number | RosettaError> {
        try {
            const response = await this.networkStatus();
            return response.current_block_identifier.index;
        } catch (error: any) {
            return new RosettaError(
                error.message,
                axios.isAxiosError(error) ? error?.response?.status : undefined,
            );
        }
    }

    /**
     * Return the Transaction object with the specified hash.
     * @param {string} transactionHash The hash of the transaction to return.
     * @returns {Transaction|null} The Transaction object with the specified hash, or a RosettaError
     * for error.
     */
    async getTransaction(transactionHash: string): Promise<Transaction | RosettaError> {
        try {
            const responseTransactions = await this.transactionsByHash(transactionHash);
            if (responseTransactions.transactions.length === 0)
                return new RosettaError('Transaction not found.', 500);

            return new Transaction(
                responseTransactions.transactions[0].transaction,
                responseTransactions.transactions[0].block_identifier.index,
            );
        } catch (error: any) {
            return new RosettaError(
                error.message,
                axios.isAxiosError(error) ? error?.response?.status : undefined,
            );
        }
    }

    /**
     * Return an array of Transaction objects based on the specified parameters, or an empty array if
     * none found.
     * @param limit {number} The maximum number of transactions to return in one call.
     * @param maxBlockIndex {number} The block index to start at. If not specified, start at current
     * block.
     * @param offset {number} The offset from maxBlockIndex to start returning transactions.
     * @returns {Promise<Array<Transaction>|null>} An array of Transaction objects, or a RosettaError
     * for error.
     */
    async getTransactions(
        limit: number,
        maxBlockIndex: number | undefined,
        offset: number,
    ): Promise<Array<Transaction> | RosettaError> {
        try {
            // This function can be simplified once /search/transactions supports using the properties
            // max_block, offset, and limit.
            let blockIndex;
            if (maxBlockIndex) blockIndex = maxBlockIndex;
            else {
                // Get the latest block index.
                const response = await this.networkStatus();
                blockIndex = response.current_block_identifier.index;
            }
            if (offset) blockIndex = Math.max(blockIndex - offset, -1);
            const transactionCount = Math.min(limit, blockIndex + 1);
            const transactions: any[] = [];
            for (let i = 0; i < transactionCount; i++)
                transactions.push(await this.getTransactionByBlock(blockIndex - i));
            return transactions;
        } catch (error: any) {
            return new RosettaError(
                error.message,
                axios.isAxiosError(error) ? error?.response?.status : undefined,
            );
        }
    }

    /**
     * Return an array of Transaction objects based on the specified parameters, or an empty array if
     * none found.
     * @param {string} accountAddress The account address to get the transactions of.
     * @returns {Promise<Array<Transaction>|null>} An array of Transaction objects, or a RosettaError
     * for error.
     */
    async getTransactionsByAccount(
        accountAddress: string,
    ): Promise<Array<Transaction> | RosettaError> {
        try {
            const response = await this.transactionsByAccount(accountAddress);
            const transactions = await Promise.all(
                response.transactions.map((blockTransaction: any) => {
                    return new Transaction(
                        blockTransaction.transaction,
                        blockTransaction.block_identifier.index,
                    );
                }),
            );
            return transactions.reverse();
        } catch (error: any) {
            return new RosettaError(
                error.message,
                axios.isAxiosError(error) ? error?.response?.status : undefined,
            );
        }
    }

    /**
     * Return the Transaction corresponding to the specified block index (i.e., block height).
     * @param {number} blockIndex The index of the block to return the Transaction for.
     * @returns {Promise<Transaction>} The Transaction corresponding to the specified block index.
     * @private
     */
    async getTransactionByBlock(blockIndex: number): Promise<Transaction> {
        const response = await this.blockByIndex(blockIndex);
        return new Transaction(response.block.transactions[0], blockIndex);
    }

    /**
     * Perform the specified http request and return the response data.
     * @param {string} url The server URL that will be used for the request.
     * @param {object} data The data to be sent as the request body.
     * @returns {Promise<any>} The response body that was provided by the server.
     * @private
     */
    async request(url: string, data: object): Promise<any> {
        return (await this.axiosInstance.request({ url: url, data: data })).data;
    }

    /**
     * Return the /network/list response, containing a list of NetworkIdentifiers that the Rosetta
     * server supports.
     * @returns {Promise<any>} The response body that was provided by the server.
     * @private
     */
    networksList(): Promise<any> {
        return this.request('/network/list', {});
    }

    /**
     * Return /network/status response, describing the current status of the network.
     * @returns {Promise<any>} The response body that was provided by the server.
     * @private
     */
    async networkStatus(): Promise<any> {
        const networkIdentifier = await this.networkIdentifier;
        return this.request('/network/status', {
            network_identifier: networkIdentifier,
        });
    }

    /**
     * Return the /account/balance response for the specified account.
     * @param {string} accountAddress The account address to get the balance of.
     * @returns {Promise<any>} The response body that was provided by the server.
     * @private
     */
    async accountBalanceByAddress(accountAddress: string): Promise<any> {
        const networkIdentifier = await this.networkIdentifier;
        return this.request('/account/balance', {
            network_identifier: networkIdentifier,
            account_identifier: { address: accountAddress },
        });
    }

    /**
     * Return the /block response for the block corresponding to the specified block index (i.e.,
     * block height).
     * @param {number} blockIndex The index of the block to return.
     * @returns {Promise<any>} The response body that was provided by the server.
     * @private
     */
    async blockByIndex(blockIndex: number): Promise<any> {
        const networkIdentifier = await this.networkIdentifier;
        return this.request('/block', {
            network_identifier: networkIdentifier,
            block_identifier: { index: blockIndex },
        });
    }

    /**
     * Return the /search/transactions response for transactions containing an operation that affects
     * the specified account.
     * @param {string} accountAddress The account address to get the transactions of.
     * @returns {Promise<any>} The response body that was provided by the server.
     * @private
     */
    async transactionsByAccount(accountAddress: string): Promise<any> {
        const networkIdentifier = await this.networkIdentifier;
        return this.request('/search/transactions', {
            network_identifier: networkIdentifier,
            account_identifier: { address: accountAddress },
        });
    }

    /**
     * Return the /search/transactions response for transactions (only one) with the specified hash.
     * @param {string} transactionHash The hash of the transaction to return.
     * @returns {Promise<any>} The response body that was provided by the server.
     * @private
     */
    async transactionsByHash(transactionHash: string): Promise<any> {
        const networkIdentifier = await this.networkIdentifier;
        return this.request('/search/transactions', {
            network_identifier: networkIdentifier,
            transaction_identifier: { hash: transactionHash },
        });
    }
}
