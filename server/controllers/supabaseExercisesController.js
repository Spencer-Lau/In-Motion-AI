import db from '../models/exerciseModels.js';

export const queryExercisesDatabase = async (req, res, next) => { // controller handling exercise search from AI generated SQL query
  const { aiQuery } = res.locals; // retrieve/extract aiQuery
  console.log('queryExercisesDatabase aiQuery: ', aiQuery);

  if (!aiQuery) {
    return next({
      log: 'queryExercisesDatabase: aiQuery not found',
      status: 400,
      message: { err: 'AI generated SQL query is missing' },
    });
  }

  try {
    // const limit = Math.min(req.body.limit || 6, 50); // add this if implementing dynamic limits via user input, e.g., max limit of 50
    const queryWithLimit = `${aiQuery} LIMIT $1`; // limit query with LIMIT clause and a parameter for a value
    const result = await db.query(queryWithLimit, [6]); // hardcoded value to limit to 6 results
    // const result = await db.query(queryWithLimit, [limit]); // change to this if implementing dynamic limits via user input
    console.log('queryExercisesDatabase queryWithLimit: ', queryWithLimit);
    console.log('queryExercisesDatabase result: ', result);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No exercises found matching the AI-assisted query' });
    }

    res.locals.queryResults = result.rows;
    console.log('queryResults: ', result.rows);
    return next();
  } catch (error) {
    return next({
      log: `queryExercisesDatabase: Error executing query "${queryWithLimit}", Error: ${error.message}`,
      status: 500,
      message: { err: 'Error occurred while executing the AI-generated query.' },
    });
  }
}
