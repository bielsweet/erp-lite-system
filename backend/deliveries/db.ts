import { SQLDatabase } from 'encore.dev/storage/sqldb';

export const deliveriesDB = new SQLDatabase("deliveries", {
  migrations: "./migrations",
});
