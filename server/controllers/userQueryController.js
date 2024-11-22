export const parseUserQuery = async (req, res, next) => {
  const { userQuery, id, muscle, category } = req.body; // extract userQuery and optional query parameters from res.body
  console.log('parseUserQuery userQuery: ', userQuery);

  if (!userQuery || typeof userQuery !== 'string' || !userQuery.trim()) { // check does userQuery exist and is not an empty string
    const error = {
      log: `parseUserQuery: Invalid user query; Input: ${JSON.stringify(req.body)}`,
      status: 400,
      message: { err: 'An error occured while parsing the user query' }
    };
    return next(error);
  }

  // if (typeof userQuery !== 'string') { // check if userQuery a string
  //   const error = {
  //     log: 'parseUserQuery: User query is not a string',
  //     status: 400,
  //     message: { err: 'An error occurred while parsing the user query' },
  //   };
  //   return next(error);
  // }

  res.locals.userQuery = sanitizeInput(userQuery.replace(/['"%;]/g, '').trim()); // assign userQuery to res.locals.userQuery and sanitize by removing special characters and trimming
  res.locals.id = id || null; // `id` is optional; set to null if not provided
  res.locals.muscle = muscle || null; // default to null if not provided
  res.locals.category = category || null; // default to null if not provided
  return next();
}
