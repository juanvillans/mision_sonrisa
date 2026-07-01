// config/knexfile.js
import { POSTGRES_URL, POSTGRES_HOST, POSTGRES_PASSWORD, POSTGRES_DATABASE, POSTGRES_USER, POSTGRES_PORT, NODE_ENV } from './env.js';

const config = {
  development: {
    client: 'pg',
    connection: POSTGRES_URL || {
      host: POSTGRES_HOST,
      port: POSTGRES_PORT,
      user: POSTGRES_USER,
      password: POSTGRES_PASSWORD,
      database: POSTGRES_DATABASE,
      charset: 'utf8'
    },
    pool: {
      min: 2,
      max: 10,
      afterCreate: (conn, done) => {
        // Asegurar que la conexión use UTF-8 para PostgreSQL
        conn.query('SET CLIENT_ENCODING TO UTF8;', (err) => {
          done(err, conn);
        });
      }
    },
    migrations: {
      directory: './database/migrations',
      extension: 'js'
    },
    seeds: {
      directory: './database/seeds',
      extension: 'js'
    }
  }
};

export default config;