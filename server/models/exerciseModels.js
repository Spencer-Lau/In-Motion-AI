import pkg from 'pg';
const { Pool } = pkg; // import Pool class from pg library, helps manage a pool of client connections to PostgreSQL database
import dotenv from 'dotenv'; // for loading environment variables
dotenv.config(); // ensure the environment variables are loaded

const PG_URI = process.env.PG_URI;

const pool = new Pool({ // new Pool instance
  connectionString: PG_URI, // database connection string from environment variables
});

export default pool; // export the pool instance to be used in controllers
