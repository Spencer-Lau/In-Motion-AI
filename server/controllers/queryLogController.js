import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// these lines determine the file path for the queryLog.txt file relative to the current module
// path.resolve ensures compatibility across different environments
const __filename = fileURLToPath(import.meta.url); // get the current file name
const __dirname = path.dirname(__filename); // get the directory name
const queryLogPath = path.resolve(__dirname, '../queryLog.txt'); // path to the log file

export const queryLogger = async (req, res, next) => {
  // console.log('queryLogController.queryLogger START');
  console.time('queryLogController.queryLogger');

  try{
    const { userQuery, aiQueryWithLimit, supabaseQueryResult, exerciseRecommendation } = res.locals; // extract desired data
    const logEntry = `
    Natural Language Query: ${userQuery || 'N/A'}
    AI-Generated SQL Query: ${aiQueryWithLimit || 'N/A'}
    Database Query Results: ${
      supabaseQueryResult
        ? JSON.stringify(supabaseQueryResult.map((result) => result.id), null, 2)
        : 'No results'
    }
    AI Response: ${exerciseRecommendation || 'N/A'}
    
    ********** ********** ********** End of Query ********** ********** **********
    `;
    // Database Query Results: only IDs are logged to keep it concise
    // AI Response: defaults to 'N/A' if a field is missing

    fs.appendFileSync(queryLogPath, logEntry); // log entry to queryLog.txt

    // console.log('queryLogController.queryLogger END');
    console.timeEnd('queryLogController.queryLogger');
    
    return next();
  } catch (error) {
    console.error('Error writing to queryLog.txt:', error);
    return next({
      log: `queryLogger: Failed to log query: ${error.message}`,
      status: 500,
      message: {
        err: 'An error occurred while logging the query.',
      },
    });
  }
};
