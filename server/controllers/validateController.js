export const validateGeneratedSQL = (req, res, next) => {
  const { aiQuery } = req;
  console.log('validateGeneratedSQL aiQuery: ', aiQuery);

  if (!aiQuery || !/^SELECT\s/i.test(aiQuery) || aiQuery.trim().endsWith(';')) { // does aiQuery exist and is it a valid SQL query
    return next({
      log: 'validateGeneratedSQL: Invalid or incomplete SQL query generated',
      status: 400,
      message: { err: 'Invalid SQL query generated' }
    });
  }
  const allowedColumns = ['id', 'primaryMuscles', 'secondaryMuscles', 'category']; // whitelist of valid column names for query
  const validSQLStructure = new RegExp(`SELECT\\s+(${allowedColumns.join('|')})`, 'i'); // parse SQL query to ensure it adheres to schema of exercises table

  if (!validSQLStructure.test(aiQuery)) {
    return next({
      log: 'validateGeneratedSQL: Generated SQL does not match schema',
      status: 400,
      message: { err: 'Generated SQL does not align with allowed schema' },
    });
  }
  
  const maliciousPatterns = /\b(DROP|DELETE|UPDATE|INSERT|TRUNCATE|ALTER|EXEC|--|#|;)\b/i; // checks for malicious keywords in the SQL query
  if (maliciousPatterns.test(aiQuery)) {
    return next({
      log: `validateGeneratedSQL: Invalid or malicious SQL detected: ${aiQuery}`,
      status: 400,
      message: { err: 'Malicious SQL detected in the generated query' },
    });
  }

  next();
}
