import { SQLDatabase } from 'encore.dev/storage/sqldb';

export const financialDB = new SQLDatabase("financial", {
  migrations: "./migrations",
});
