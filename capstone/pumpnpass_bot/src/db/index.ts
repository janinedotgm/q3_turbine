// import { drizzle } from 'drizzle-orm/node-postgres';
// import { Pool } from 'pg';

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL, // Use your actual connection string
// });

// export const db = drizzle(pool);



import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
config({ path: '.env' }); // or .env.local
const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client);