import db from '../models/exerciseModels.js';

const exerciseController = {};

export const searchExercises = async (req, res, next) => { // controller handling exercise search with dynamic query parameters
  console.time('exerciseController.searchExercises');

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

    console.timeEnd('exerciseController.searchExercises');

    return res.json(result.rows); // return the matching exercises
  } catch (error) {
    console.error('Search error:', error);
    return next({
      log: `Error in exerciseController.searchExercises: ${error}`,
      message: { err: 'Error occurred retrieving exercises.' },
    });
  }
};

export const getDropdownOptions = async (req, res, next) => { // middleware fetches unique muscles and categories for dropdown from database
  console.time('exerciseController.getDropdownOptions');

  try { // query to get distinct primary muscles
    const musclesQuery = `SELECT DISTINCT UNNEST(exercises."primaryMuscles") AS muscle FROM exercises WHERE exercises."primaryMuscles" IS NOT NULL
      UNION
      SELECT DISTINCT UNNEST(exercises."secondaryMuscles") AS muscle FROM exercises WHERE exercises."secondaryMuscles" IS NOT NULL;`;
    const musclesResult  = await db.query(musclesQuery);

    const categoriesQuery  = `SELECT DISTINCT category FROM exercises WHERE category IS NOT NULL`;
    const categoriesResult  = await db.query(categoriesQuery );
    
    req.uniqueMuscles = musclesResult.rows.map(row => row.muscle);
    req.uniqueCategories = categoriesResult.rows.map(row => row.category); // attach the unique categories to the request object

    console.timeEnd('exerciseController.getDropdownOptions');

    return next();
  } catch (error) {
    console.error('Error fetching unique muscles and categories:', error);
    return next({
      log: `Error in exerciseController.getDropdownOptions: ${error}`,
      message: { err: 'Error occurred retrieving unique muscles and cetegories.' },
    });
  }
};
