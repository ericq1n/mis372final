import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface TransactionAttributes {
  transactionId: string;
  accountFromId?: string;
  accountToId: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  status: 'completed' | 'failed';
  createdAt?: Date;
}

interface TransactionCreationAttributes extends Optional<TransactionAttributes, 'transactionId' | 'status' | 'createdAt'> {}

class Transaction extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
  public transactionId!: string;
  public accountFromId?: string;
  public accountToId!: string;
  public type!: 'deposit' | 'withdrawal' | 'transfer';
  public amount!: number;
  public status!: 'completed' | 'failed';
  public createdAt?: Date;
}

Transaction.init(
  {
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
  },
  {
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
  }
);

export default Transaction;
