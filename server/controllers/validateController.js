export const validateGeneratedSQL = (req, res, next) => {
  // console.log('validateController.validateGeneratedSQL START');
  console.time('validateController.validateGeneratedSQL');

  const { aiQueryWithLimit } = res.locals;

  // console.log('validateGeneratedSQL aiQueryWithLimit: ', aiQueryWithLimit);

  if (!aiQueryWithLimit || !/^SELECT\s/i.test(aiQueryWithLimit) || !aiQueryWithLimit.trim().endsWith(';')) { // does aiQueryWithLimit exist and is it a valid SQL query
    return next({
      log: 'validateGeneratedSQL: Invalid or incomplete SQL query generated',
      status: 400,
      message: { err: 'Invalid SQL query generated' }
    });
  }

  const allowedColumns = ['id', 'primaryMuscles', 'secondaryMuscles', 'category']; // whitelist of valid column names for query
  const validSQLStructure = new RegExp(`(${allowedColumns.join('|')})`, 'i');
  // const validSQLStructure = new RegExp(`SELECT\\s+(${allowedColumns.join('|')})`, 'i'); // parse SQL query to ensure it adheres to schema of exercises table

  if (!validSQLStructure.test(aiQueryWithLimit)) {
    return next({
      log: 'validateGeneratedSQL: Generated SQL does not match schema',
      status: 400,
      message: { err: 'Generated SQL does not align with allowed schema' },
    });
  }
  
  const maliciousPatterns = /\b(DROP|DELETE|UPDATE|INSERT|TRUNCATE|ALTER|EXEC|--|#|;)\b/i; // checks for malicious keywords in the SQL query

  if (maliciousPatterns.test(aiQueryWithLimit)) {
    return next({
      log: `validateGeneratedSQL: Invalid or malicious SQL detected: ${aiQueryWithLimit}`,
      status: 400,
      message: { err: 'Malicious SQL detected in the generated query' },
    });
  }

  // console.log('validateController.validateGeneratedSQL END');
  console.timeEnd('validateController.validateGeneratedSQL');
  
  return next();
}
