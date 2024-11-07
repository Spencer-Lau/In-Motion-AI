import express from 'express'; // import Express
import path from 'path';
import cors from 'cors';
import exerciseRoutes from './routes/exerciseRoutes.js'; // Import exercise routes
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv'; // for loading environment variables
dotenv.config(); // ensure the environment variables are loaded

const app = express(); // app, new instance of Express()

// console.log(app); // to see the methods that come with Express app

// get __dirname in an ES Module environment
const __filename = fileURLToPath(import.meta.url); // converts the current module's URL to a file path
const __dirname = dirname(__filename); // gets the directory name of the current module

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLIC_ANON_KEY)

const allowedOrigin = process.env.NODE_ENV === 'production' ? 'https://your-production-domain.com' : 'http://localhost:3000'; // production vs development URL
app.use(cors({origin: allowedOrigin})); // allows frontend to make requests to the backend (CORS middleware)
app.use(express.json()); // automatically parse incoming JSON requests/bodies/payloads

app.use('/api', exerciseRoutes); // default for requests with /api endpoint to use exerciseRoutes

app.use(express.static(join(__dirname, '../client/build'))); // Serve static files from the 'build' directory

app.get('/api/search', async (req, res) => {
  const { id } = req.query; // get 'term' query parameter from the request URL/frontend
  console.log(`Searching for: ${id}`); // log search id/term

  if (!id) {
    return res.status(400).json({ error: 'Please provide a search term' });
  }

  try {
    const { data, error } = await supabase // query Supabase
      .from('exercises') // from exercises table
      .select('*')
      .ilike('id', `%${id}%`); // ilike is a case-insensitive partial match operator, searching for rows where id partially matches term

    if (data.length === 0) {
      return res.status(404).json({ error: 'No exercises found' });
    }
      
    if (error) {
      console.error('Error querying Supabase:', error.message);
      return res.status(500).json({
        error: 'Database query error',
        details: error.message
      });
    }
    

    res.json(data); // send matching exercises data as JSON back to frontend 
  } catch (err) {
    console.error('Error in /api/search:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../client/build', 'index.html'));
});

// Global error handling middleware (basic)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Error occurred:', err); // Log the full error object for debugging
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred' },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

app.listen(8080, () => {
  console.log('server listening on port 8080')
});