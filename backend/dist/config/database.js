import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();
const DATABASE_URL = process.env.DATABASE_URL;
const DB_SCHEMA = process.env.DB_SCHEMA || 'banking';
const useSsl = process.env.PGSSLMODE === 'require';
if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in environment variables');
}
const sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: useSsl
        ? {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        }
        : undefined,
    define: {
        schema: DB_SCHEMA,
    },
});
export default sequelize;
//# sourceMappingURL=database.js.map