export const parseUserQuery = async (req, res, next) => {
  // console.log('userQueryController.parseUserQuery START');
  console.time('userQueryController.parseUserQuery');

  const { aiUserQuery/*, id, muscle, category*/ } = req.body; // extract userQuery and optional query parameters from res.body
  // console.log('parseUserQuery aiUserQuery: ', aiUserQuery);

  if (!aiUserQuery || typeof aiUserQuery !== 'string' || !aiUserQuery.trim()) { // check does userQuery exist and is not an empty string
  // if (!aiUserQuery) { // check does userQuery exist and is not an empty string
    const error = {
      log: `parseUserQuery: Invalid user query; Input: ${JSON.stringify(req.body)}`,
      status: 400,
      message: { err: 'An error occured while parsing the user query' }
    };
    return next(error);
  }

  res.locals.userQuery = aiUserQuery;
  // res.locals.userQuery = sanitizeInput(aiUserQuery.replace(/['"%;]/g, '').trim()); // assign userQuery to res.locals.userQuery and sanitize by removing special characters and trimming
  // res.locals.id = id || null; // `id` is optional; set to null if not provided
  // res.locals.muscle = muscle || null; // default to null if not provided
  // res.locals.category = category || null; // default to null if not provided

  // console.log('userQueryController.parseUserQuery END');
  console.timeEnd('userQueryController.parseUserQuery');

  return next();
}
