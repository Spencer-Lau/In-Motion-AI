import express from 'express'; // import Express
import cors from 'cors';
import dotenv from 'dotenv'; // for loading environment variables
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import exerciseRoutes from './routes/exerciseRoutes.js'; // import exercise routes

dotenv.config(); // ensure the environment variables are loaded

const app = express(); // app, new instance of Express()
const PORT = process.env.PORT || 8080; // use port from .env or default to 8080

// get __dirname is an ES Module environment
const __filename = fileURLToPath(import.meta.url); // converts the current module's URL to a file path
const __dirname = dirname(__filename); // gets the directory name of the current module
// const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLIC_ANON_KEY) // initialize Supabase client

const allowedOrigin = process.env.NODE_ENV === 'production' ? 'http://localhost:3000' /* https://your-production-domain.com' */ : 'http://localhost:3000'; // set up CORS based on environment, production vs development URL
app.use(cors({ origin: allowedOrigin })); // allows frontend to make requests to the backend (CORS middleware)
app.use(express.json()); // parses incoming JSON requests/bodies/payloads

app.use('/api', exerciseRoutes); // default for requests with /api endpoint to use exerciseRoutes

app.get('/api/unique-values', (req, res) => { // route to fetch unique values (muscles & categories)
  res.json({ // this handler is called after both the middleware functions have executed successfully
    muscles: req.uniqueMuscles, // muscles array will be attached to req by getUniqueMuscles
    categories: req.uniqueCategories, // categories array will be attached to req by getUniqueCategories
  });
});

if (process.env.NODE_ENV === 'production') { // serve static files from the 'build' directory of the React app
  app.use(express.static(join(__dirname, '../client/build'))); // serve static files from the 'build' directory

  app.get('*', (req, res) => { // catch-all route to handle GET requests and serve index.html, the React entry point
    res.sendFile(join(__dirname, '../client/build', 'index.html'));
  });
} else { // in development mode, React app served by React dev server
  console.log('In development mode, React app is served by React development server');
}

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => { // global error handling middleware
  console.error('Error occurred:', err); // log the full error object for debugging
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred' },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

app.listen(PORT, () => { // start server
  console.log(`server listening on port ${PORT}`)
});
