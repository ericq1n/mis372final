import { Model, Optional } from 'sequelize';
interface TransactionAttributes {
    transactionId: string;
    accountFromId?: string;
    accountToId: string;
    type: 'deposit' | 'withdrawal' | 'transfer';
    amount: number;
    status: 'completed' | 'failed';
    createdAt?: Date;
}
interface TransactionCreationAttributes extends Optional<TransactionAttributes, 'transactionId' | 'status' | 'createdAt'> {
}
declare class Transaction extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
    transactionId: string;
    accountFromId?: string;
    accountToId: string;
    type: 'deposit' | 'withdrawal' | 'transfer';
    amount: number;
    status: 'completed' | 'failed';
    createdAt?: Date;
}
export default Transaction;
//# sourceMappingURL=Transaction.d.ts.map