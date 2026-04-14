import { Model, Optional } from 'sequelize';
interface UserAttributes {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    zipCode?: string;
    city?: string;
    state?: string;
    dateOfBirth?: Date;
    active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
interface UserCreationAttributes extends Optional<UserAttributes, 'userId' | 'active' | 'createdAt' | 'updatedAt'> {
}
declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    zipCode?: string;
    city?: string;
    state?: string;
    dateOfBirth?: Date;
    active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export default User;
//# sourceMappingURL=User.d.ts.map