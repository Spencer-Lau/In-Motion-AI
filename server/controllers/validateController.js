export const validateGeneratedSQL = (req, res, next) => {
  const { aiQuery } = req;
  if (!aiQuery || !/^SELECT\s/i.test(aiQuery) || aiQuery.trim().endsWith(';')) { // does aiQuery exist and is it a valid SQL query
    return next({
      log: 'validateGeneratedSQL: Invalid or incomplete SQL query generated',
      status: 400,
      message: { err: 'Invalid SQL query generated' }
    });
  }

  const maliciousPatterns = /DROP|DELETE|UPDATE|INSERT|TRUNCATE|--/i; // checks for malicious keywords in the SQL query
  if (maliciousPatterns.test(aiQuery)) {
    return next({
      log: 'validateGeneratedSQL: Malicious SQL detected, aiQuery',
      status: 400,
      message: { err: 'Malicious SQL detected in the generated query' },
    });
  }

  next();
}
