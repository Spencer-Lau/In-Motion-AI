import db from '../models/exerciseModels.js';

export const queryExercisesDatabase = async (req, res, next) => { // controller handling exercise search from AI generated SQL query
  // console.log('supabaseExercisesController.queryExercisesDatabase START');
  console.time('supabaseExercisesController.queryExercisesDatabase');

  const { aiQueryWithLimit } = res.locals; // retrieve/extract aiQueryWithLimit

  if (!aiQueryWithLimit) {
    return next({
      log: 'queryExercisesDatabase: aiQueryWithLimit not found',
      status: 400,
      message: { err: 'AI generated SQL query is missing' },
    });
  }

  // let aiQueryWithLimit = ''; // ensure aiQueryWithLimit is defined outside the try block

  try {
    console.log('queryExercisesDatabase aiQueryWithLimit: ', aiQueryWithLimit);
    // const limit = Math.min(req.body.limit || 6, 50); // add this if implementing dynamic limits via user input, e.g., max limit of 50
    // const result = await db.query(aiQueryWithLimit, [limit]); // change to this if implementing dynamic limits via user input
    const result = await db.query(aiQueryWithLimit, [1]); // hardcoded value to limit to 6 results
    // console.log('queryExercisesDatabase result: ', result); // contains result and metadata, not necessary to see but included for thoroughness

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No exercises found matching the AI-assisted query' });
    }

    res.locals.supabaseQueryResult = result.rows;

    // console.log('supabaseExercisesController supabaseQueryResult: ', result.rows);
    // console.log('supabaseExercisesController.queryExercisesDatabase END');
    // console.timeEnd('supabaseExercisesController.queryExercisesDatabase');
    
    return next();
  } catch (error) {
    return next({
      log: `queryExercisesDatabase: Error executing query "${queryWithLimit}", Error: ${error.message}`,
      status: 500,
      message: { err: 'Error occurred while executing the AI-generated query.' },
    });
  }
}
