import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface AiReportAttributes {
  reportId: string;
  userId: string;
  month: string;
  reportText: string;
  statsJson: string;
  createdAt?: Date;
}

interface AiReportCreationAttributes extends Optional<AiReportAttributes, 'reportId' | 'createdAt'> {}

class AiReport extends Model<AiReportAttributes, AiReportCreationAttributes> implements AiReportAttributes {
  public reportId!: string;
  public userId!: string;
  public month!: string;
  public reportText!: string;
  public statsJson!: string;
  public createdAt?: Date;
}

AiReport.init(
  {
    reportId: {
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
    month: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reportText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    statsJson: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'AiReport',
    tableName: 'ai_reports',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['userId'] },
      { fields: ['userId', 'month'], unique: true },
    ],
  }
);

export default AiReport;
