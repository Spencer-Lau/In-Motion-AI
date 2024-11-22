import db from '../models/exerciseModels.js';

const exerciseController = {};

export const searchExercises = async (req, res, next) => { // controller handling exercise search with dynamic query parameters
  const { id, muscle, category } = req.query; // get the search parameters from the query
  
  if (!id && !muscle && !category) { // if no filter or search term is provided
    return res.status(400).json({ message: 'At least one search filter (id, muscle, or category) is required' });
  }

  // Start with a base query to get all exercises
  let query = 'SELECT exercises.* FROM exercises WHERE 1=1'; // '1=1' is just a placeholder for the WHERE clause
  const queryParams = [];

  if (id) {
    query += ` AND exercises.id ILIKE $${queryParams.length + 1}`; // add condition for searching by id
    queryParams.push(`%${id}%`);
  }

  if (muscle) {
    query += ` AND (exercises."primaryMuscles" @> $${queryParams.length + 1} OR exercises."secondaryMuscles" @> $${queryParams.length + 1})`; // filter by muscle
    queryParams.push(`{${muscle}}`); // array syntax for muscle matching, does not work as a string (queryParams.push(muscle)), error
  }

  if (category) {
    query += ` AND exercises.category = $${queryParams.length + 1}`; // filter by category
    queryParams.push(category); // assuming `category` is a string (e.g., 'strength')
  }

  try { // execute query and handle response
    const result = await db.query(query, queryParams); // execute the query with the dynamic conditions
    // console.log(query, queryParams);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No exercises found' });
    }
    return res.json(result.rows); // return the matching exercises
  } catch (error) {
    console.error('Search error:', error);
    return next({
      log: `Error in exerciseController.searchExercises: ${error}`,
      message: { err: 'Error occurred retrieving exercises.' },
    });
  }
};

export const getUniqueMuscles = async (req, res, next) => { // middleware fetches unique muscles for dropdown from database
  try { // query to get distinct primary muscles
    const query = `SELECT DISTINCT UNNEST(exercises."primaryMuscles") AS muscle FROM exercises WHERE exercises."primaryMuscles" IS NOT NULL
      UNION
      SELECT DISTINCT UNNEST(exercises."secondaryMuscles") AS muscle FROM exercises WHERE exercises."secondaryMuscles" IS NOT NULL;`;
    const result = await db.query(query);

    req.uniqueMuscles = result.rows.map(row => row.muscle);
    return next();
  } catch (error) {
    console.error('Error fetching unique muscles:', error);
    return next({
      log: `Error in exerciseController.getUniqueMuscles: ${error}`,
      message: { err: 'Error occurred retrieving unique muscles.' },
    });
  }
};

export const getUniqueCategories = async (req, res, next) => { // middleware fetches unique categories from the database
  try { // query to get distinct categories
    const query = `SELECT DISTINCT category FROM exercises WHERE category IS NOT NULL`;
    const result = await db.query(query);
    
    req.uniqueCategories = result.rows.map(row => row.category); // attach the unique categories to the request object
    return next(); // pass control to the next middleware or route handler
  } catch (error) {
    console.error('Error fetching unique categories:', error);
    return next({
      log: `Error in exerciseController.getUniqueCategories: ${error}`,
      message: { err: 'Error occurred retrieving unique categories.' },
    });
  }
};
