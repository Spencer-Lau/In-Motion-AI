import db from '../models/exerciseModels.js';

const exerciseController = {};

exerciseController.searchExercises = async (req, res, next) => {
  const { id, muscle, category } = req.query; // get the search parameters from the query
  
  if (!id && !muscle && !category) { // if no filter or search term is provided
    return res.status(400).json({ message: 'At least one search filter (id, muscle, or category) is required' });
  }

  // Start with a base query to get all exercises
  let query = 'SELECT exercises.* FROM exercises WHERE 1=1'; // '1=1' is just a placeholder for the WHERE clause
  const queryParams = [];

  // const query = `SELECT exercises.* FROM exercises WHERE exercises.id ILIKE $1`;
  
  if (id) {
    query += ' AND exercises.id ILIKE $1'; // add condition for searching by id
    queryParams.push(`%${id}%`);
  }

  if (muscle) {
    query += ' AND (exercises."primaryMuscles" @> $2 OR exercises."secondaryMuscles" @> $2)'; // filter by muscle
    queryParams.push(muscle); // assuming `muscle` is a string (e.g., 'biceps')
  }

  if (category) {
    query += ' AND exercises.category = $3'; // filter by category
    queryParams.push(category); // assuming `category` is a string (e.g., 'strength')
  }

  try {
    const result = await db.query(query, queryParams); // execute the query with the dynamic conditions
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

exerciseController.getUniqueMuscles = async (req, res, next) => { // middleware to get unique muscles from the database
  try { // query to get distinct primary muscles
    const query = `SELECT DISTINCT UNNEST (exercises."primaryMuscles") AS muscle FROM exercises WHERE exercises."primaryMuscles" IS NOT NULL UNION SELECT DISTINCT UNNEST (exercises."secondaryMuscles") AS muscle FROM exercises WHERE exercises."secondaryMuscles" IS NOT NULL`;
    const result = await db.query(query);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No muscles found' });
    }
    
    req.uniqueMuscles = result.rows.map(row => row.muscle); // attach the unique muscles to the request object
    // console.log('Unique Muscles:', req.uniqueMuscles); // debug log to see if muscles are being fetched
    return next(); // pass control to the next middleware or route handler
  } catch (error) {
    console.error('Error fetching unique muscles:', error);
    return next({
      log: `Error in exerciseController.getUniqueMuscles: ${error}`,
      message: { err: 'Error occurred retrieving unique muscles.' },
    });
  }
};

exerciseController.getUniqueCategories = async (req, res, next) => { // middleware to get unique categories from the database
  try { // query to get distinct categories
    const query = `SELECT DISTINCT category FROM exercises WHERE category IS NOT NULL`;
    const result = await db.query(query);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No categories found' });
    }
    
    req.uniqueCategories = result.rows.map(row => row.category); // attach the unique categories to the request object
    // console.log('Unique Categories:', req.uniqueCategories); // debug log to see if categories are being fetched
    return next(); // pass control to the next middleware or route handler
  } catch (error) {
    console.error('Error fetching unique categories:', error);
    return next({
      log: `Error in exerciseController.getUniqueCategories: ${error}`,
      message: { err: 'Error occurred retrieving unique categories.' },
    });
  }
};

export default exerciseController;
