export const parseUserQuery = async (req, res, next) => {
  if (!req.body.userQuery || !userQuery.trim()) { // check does userQuery exist and is not an empty string
    const error = {
      log: 'parseUserQuery: User query not provided or empty',
      status: 400,
      message: { err: 'An error occured while parsing the user query' }
    };
    return next(error);
  }

  const { userQuery, id, muscle, category } = req.body; // extract userQuery and optional query parameters from res.body

  // const { userQuery } = req.body; // extract userQuery from res.body
  // const { id } = req.body; // extract optional query parameters from req.body
  // const { muscle } = req.body;
  // const { category } = req.body;

  if (typeof userQuery !== 'string') { // check if userQuery a string
    const error = {
      log: 'parseUserQuery: User query is not a string',
      status: 400,
      message: { err: 'An error occurred while parsing the user query' },
    };
    return next(error);
  }

  res.locals.userQuery = userQuery.trim(); // assign userQuery to res.locals.userQuery
  res.locals.id = id || null; // `id` is optional; set to null if not provided
  res.locals.muscle = muscle || []; // default to empty array if not provided
  res.locals.category = category || []; // default to empty array if not provided
  return next();
}
