import db from '../models/exerciseModels.js';

export const queryExercisesDatabase = async (req, res, next) => { // controller handling exercise search from AI generated SQL query
  const { aiQuery } = res.locals; // retrieve/extract aiQuery

  if (!aiQuery) {
    return next({
      log: 'queryExercisesDatabase: aiQuery not found',
      status: 400,
      message: { err: 'AI generated SQL query is missing' },
    });
  }

  try {
    const queryWithLimit = `${aiQuery} LIMIT 6`;// limit query to 6 results with `LIMIT 6` clause
    const result = await db.query(queryWithLimit);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No exercises found matching the AI-assisted query' });
    }

    res.locals.queryResults = result.rows;
    console.log('queryResults: ', result.rows);
    return next();
  } catch (error) {
    return next({
      log: `queryExercisesDatabase: Error: ${error.message}`,
      status: 500,
      message: { err: 'Error occurred while executing the AI-generated query.' },
    });
  }
}
