import express from 'express'; // imports express
import { searchExercises, getUniqueMuscles, getUniqueCategories } from '../controllers/exerciseController.js'; // imports exerciseController module (handles original id/name, muscle dropdown, and category dropdown SQL query generation, db req, and response)
import { parseUserQuery } from '../controllers/userQueryController.js'; // check if user natural language query exists and is a string, can tie in the original search functionality later on
import {
  openAIQuery,
  openAIResponse,
} from '../controllers/openaiController.js'; // generate SQL query from natural language query also shapes user response from database response
import { validateGeneratedSQL } from '../controllers/validateController.js'; // validates AI query for safety
import { queryExercisesDatabase } from '../controllers/supabaseExercisesController.js'; // generate database response from AI SQL query
import { testGoldenDataset } from '../controllers/goldenDatasetController.js'; // test database response against golden dataset
import { queryLogger } from '../controllers/queryLogController.js'; // create log entries

const router = express.Router(); // imports Router() from Express

router.get('/search', searchExercises); // route searching exercises based on id, muscle, and category

router.get(
  '/unique-values',
  getUniqueMuscles,
  getUniqueCategories,
  (req, res) => {
    // route fetches unique muscles and categories
    res.json({
      // if both middlewares run without errors, send the response
      muscles: req.uniqueMuscles,
      categories: req.uniqueCategories,
    });
  }
);

router.post(
  '/aisearch',
  parseUserQuery, // extract and validate naturalLanguageQuery input
  openAIQuery, // generate SQL query
  validateGeneratedSQL, // validate AI-generated SQL
  queryExercisesDatabase, // query database
  testGoldenDataset, // compare results to golden dataset
  openAIResponse, // shape database response individualized to user input
  queryLogger // log user and AI queries and database and AI results
);

export default router;
