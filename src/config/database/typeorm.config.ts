import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join, resolve } from 'path';

config();

// Log das variáveis de ambiente
console.log('Variáveis de ambiente:', {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_DATABASE: process.env.DB_DATABASE,
});

// Caminhos absolutos
const migrationsPath = resolve(__dirname, '..', '..', 'database', 'migrations', '*.ts');
const entitiesPath = resolve(__dirname, '..', '**', '*.entity{.ts,.js}');

console.log('Caminhos:', {
  migrationsPath,
  entitiesPath,
  __dirname,
});

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'postgres',
  entities: [entitiesPath],
  migrations: [migrationsPath],
  synchronize: false,
  logging: ['query', 'error', 'schema', 'warn', 'info', 'log'],
  schema: 'public',
});

// Log da configuração
console.log('TypeORM Config:', {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  database: process.env.DB_DATABASE || 'postgres',
  entities: [entitiesPath],
  migrations: [migrationsPath],
  schema: 'public',
});

export default dataSource;