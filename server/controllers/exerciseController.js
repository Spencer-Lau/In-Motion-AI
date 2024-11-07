import db from '../models/exerciseModels.js';

const exerciseController = {};

exerciseController.searchExercises = async (req, res, next) => {
  const searchId = req.query.id; // grab the query parameter from the URL
  
  if (!searchId) { // checks for a search Id/term
    return res.status(400).json({ message: 'Search term is required' });
  }

  const query = `SELECT exercises.* FROM exercises WHERE exercises.id ILIKE $1`;
  
  try {
    const result = await db.query(query, [`%${searchId}%`]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No exercises found' });
    }
      return res.json(result.rows); // Send back the list of exercises
    }
  catch(error) {
    console.error('Search error:', error);
    return next({
      log: `Error in exerciseController.getExercises: ${error}`,
      message: { err: 'Error occured retrieving exercises.' },
    });
  }
};

export default exerciseController;
