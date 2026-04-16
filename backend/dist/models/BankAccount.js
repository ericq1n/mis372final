import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
class BankAccount extends Model {
}
BankAccount.init({
    accountId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'users',
            key: 'userId',
        },
    },
    accountNumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    accountName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    accountType: {
        type: DataTypes.ENUM('checking', 'savings'),
        allowNull: false,
    },
    balance: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
    },
    apy: {
        type: DataTypes.DECIMAL(5, 3),
        allowNull: true,
    },
    dateCreated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    sequelize,
    modelName: 'BankAccount',
    tableName: 'bank_accounts',
    timestamps: true,
    indexes: [
        { fields: ['userId'] },
        { fields: ['accountNumber'], unique: true },
    ],
});
export default BankAccount;
//# sourceMappingURL=BankAccount.js.map