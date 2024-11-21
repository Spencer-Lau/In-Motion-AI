import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const openai = new OpenAI({
  organization: process.env.OPENAI_ORG_ID,
  apiKey: process.env.OPENAI_API_KEY,
});

export const openAIQuery = async (req, res, next) => {
  const { userQuery } = res.locals;

  if (!userQuery) {
    const error = {
      log: 'openAIQuery: missing userQuery in res.locals',
      status: 500,
      message: { err: 'An error occured before openAIQuery'}
    };
    return next(error);
  }
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Based on the user query "${userQuery}", generate a SQL query to search the "exercises" table. 
          - The table has columns: "id" (partial matching), "primaryMuscles", "secondaryMuscles", and "category".
          - Generate a well-rounded selection of exercises if specific columns are not provided in the query.
          Example SQL:
          SELECT exercises.* 
          FROM exercises 
          WHERE 1=1 
          AND exercises.id ILIKE $${queryParams.length + 1} 
          AND (exercises."primaryMuscles" @> $${queryParams.length + 1} 
          OR exercises."secondaryMuscles" @> $${queryParams.length + 1})`
          // Muscle groups include: abdominals, abductors, adductors, biceps, calves, chest, forearms, glutes, hamstrings, lats, lower back, middle back, neck, quadriceps, shoulders, traps, triceps.
          // Categories include: cardio, olympic weight lifting, plyometrics, powerlifting, strength, stretching, strongman.
        },
      ],
    });
    
    const aiQuery = await response?.choices?.[0]?.message?.content?.trim(); // prevents crashes and stops progressing if any part of the chain is null or undefined using the optional chaining operator (?), and sanitizes the string with .trim() only if the preceding chain is a valid string

    if (!aiQuery) {
      return next({
        log: 'openAIQuery: OpenAI did not return a completion',
        status: 500,
        message: { err: 'Failed to generate SQL query from OpenAI' },
      });
    }
    
    res.locals.aiQuery = aiQuery;
    console.log('aiQuery: ', aiQuery);
    return next();
  } catch (error) {
    return next({
      log: `openAIQuery: OpenAI API error: ${error.message}`,
      status: 500,
      message: { err: 'An error occured while querying OpenAI' }
    });
  }
}

export const openAIResponse = async (req, res, next) =>{
  const { aiQuery, supabaseQueryResult, userQuery } = res.locals;

  if (!aiQuery) {
    const error = {
      log: 'openAIResponse: Missing aiQuery in res.locals',
      status: 500,
      message: { err: 'An error occurred before querying OpenAI' },
    };
    return next(error);
  }

  if (!supabaseQueryResult) {
    const error = {
      log: 'openAIResponse: Missing supabaseQueryResult in res.locals',
      status: 500,
      message: { err: 'An error occurred before querying OpenAI' },
    };
    return next(error);
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `The database returned these results for the user query "${userQuery}":
          ${JSON.stringify(supabaseQueryResult, null, 2)}.
          - Describe how each recommendation relates to the user query.
          - Provide a summary of how all exercises relate to the query.
          - Express confidence in the recommendation as a percentage.`
        },
      ],
    });

    const exerciseRecommendation = response?.choices?.[0]?.message?.content?.trim();
    if (!exerciseRecommendation) {
      return next({
        log: 'openAIResponse: OpenAI did not return a completion',
        status: 500,
        message: { err: 'An error occurred while querying OpenAI' },
      });
    }

      res.locals.exerciseRecommendation = exerciseRecommendation;
      return next();
  } catch (err) {
    return next({
      log: `openAIResponse: OpenAI API error: ${err.message}`,
      status: 500,
      message: { err: 'An error occurred while querying OpenAI' },
    });
  }
};