import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface BankAccountAttributes {
  accountId: string;
  userId: string;
  accountNumber: string;
  accountName?: string;
  accountType: 'checking' | 'savings';
  balance: number;
  apy?: number;
  dateCreated?: Date;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BankAccountCreationAttributes extends Optional<BankAccountAttributes, 'accountId' | 'balance' | 'active' | 'dateCreated' | 'createdAt' | 'updatedAt'> {}

class BankAccount extends Model<BankAccountAttributes, BankAccountCreationAttributes> implements BankAccountAttributes {
  public accountId!: string;
  public userId!: string;
  public accountNumber!: string;
  public accountName?: string;
  public accountType!: 'checking' | 'savings';
  public balance!: number;
  public apy?: number;
  public dateCreated?: Date;
  public active!: boolean;
  public createdAt?: Date;
  public updatedAt?: Date;
}

BankAccount.init(
  {
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
  },
  {
    sequelize,
    modelName: 'BankAccount',
    tableName: 'bank_accounts',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['accountNumber'], unique: true },
    ],
  }
);

export default BankAccount;
