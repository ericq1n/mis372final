import { Model, Optional } from 'sequelize';
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
interface BankAccountCreationAttributes extends Optional<BankAccountAttributes, 'accountId' | 'balance' | 'active' | 'dateCreated' | 'createdAt' | 'updatedAt'> {
}
declare class BankAccount extends Model<BankAccountAttributes, BankAccountCreationAttributes> implements BankAccountAttributes {
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
export default BankAccount;
//# sourceMappingURL=BankAccount.d.ts.map