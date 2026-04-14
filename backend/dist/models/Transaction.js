import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
class Transaction extends Model {
}
Transaction.init({
    transactionId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    accountFromId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'bank_accounts',
            key: 'accountId',
        },
    },
    accountToId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'bank_accounts',
            key: 'accountId',
        },
    },
    type: {
        type: DataTypes.ENUM('deposit', 'withdrawal', 'transfer'),
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('completed', 'failed'),
        defaultValue: 'completed',
    },
}, {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions',
    timestamps: true,
    updatedAt: false,
    indexes: [
        { fields: ['accountFromId'] },
        { fields: ['accountToId'] },
        { fields: ['createdAt'] },
    ],
});
export default Transaction;
//# sourceMappingURL=Transaction.js.map