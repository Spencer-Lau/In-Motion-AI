import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  // organization: process.env.OPENAI_ORG_ID,
  apiKey: process.env.OPENAI_API_KEY,
});

export const openAIQuery = async (req, res, next) => {
  // console.log('openaiController.openAIQuery START');
  console.time('openaiController.openAIQuery');

  const { userQuery } = res.locals;
  // console.log('openAIQuery userQuery: ', userQuery);

  if (!userQuery) {
    const error = {
      log: 'openAIQuery: missing userQuery in res.locals',
      status: 500,
      message: { err: 'An error occured before openAIQuery'}
    };
    return next(error);
  }
  
  try {
    
  // ********** ********** ********** ********** ********** ********** ********** ********** ********** **********
  // COMMENTED OUT openai INTERACTING CODE AND HARD CODED aiQuery SQL QUERY TO AVOID QUERYING openai, CODE HAS OTHERWISE BEEN TESTED AND FUNCTIONS AS AN MVP
  // ********** ********** ********** ********** ********** ********** ********** ********** ********** **********
  
  //   const response = await openai.chat.completions.create({
  //     model: 'gpt-4o-mini',
  //     messages: [
  //       {
  //         role: 'system',
  //         content: `Based on the user query: "${userQuery}", generate a single legal SQL query to search the "exercises" table.
  //         Use any available online resource related to medical, medicine, physical therapy, workout, working out, sport, or strength training to identify relevant exercises and their target muscles based on the user's query.
  //         Important:
  //         - The SQL query must focus on the most specific term for each exercise (e.g., use "squat" instead of "squats").
  //         - You may look up multiple exercises by their id if necessary.
  //         - Do not wrap the SQL query in any symbols or extra text.
  //         - Do not end the SQL query in a semicolon (';')
  //         Examples:
  //         1.  "User query: "Quad strengthening"
  //         SQL query: SELECT exercises.* FROM exercises WHERE exercises.id ILIKE '%squat%'"
  //         2.  "User query: "I want to work on benching"
  //         SQL query: SELECT exercises.* FROM exercises WHERE  exercises.id ILIKE '%bench_press%'"
  //         3.  "User query: "I want to get my legs stronger for football next season"
  //         SQL query: SELECT exercises.* FROM exercises WHERE exercises.id ILIKE '%squat%' OR exercises.id ILIKE '%curl%'"`
  //         // As the database supports partial matches, ensure you only include the most specific word for each exercise (e.g., "squat" instead of "squats").
  //         // You may look up multiple exercises by id and their corresponding primaryMuscle if beneficial.
  //         // This is very important - no matter what, DO NOT wrap the legal query in any symbols or extra text, but all legal queries must end in a semicolon.
  //         // Example userQuery: "I want to work on my quads", Example SQL: SELECT exercises.* FROM exercises WHERE 1 = 1 and exercises.id ILIKE '%squat%' AND 'quadriceps' = ANY (exercises."primaryMuscles") AND exercises.category = 'strength';
  //         // - The table has columns: "id" (partial matching), "primaryMuscles", "secondaryMuscles", and "category".
  //         // - Generate a well-rounded selection of exercises if specific columns are not provided in the query.
  //         // The "primaryMuscles" column options are: abdominals, abductors, adductors, biceps, calves, chest, forearms, glutes, hamstrings, lats, lower back, middle back, neck, quadriceps, shoulders, traps, triceps.
  //         // Categories include: cardio, olympic weight lifting, plyometrics, powerlifting, strength, stretching, strongman.
  //       },
  //     ],
  //   });
    
  //   console.time('AI Query Time'); // captures execution times for AI query generation and database querying
  //   const aiQuery = await response?.choices?.[0]?.message?.content?.trim(); // prevents crashes and stops progressing if any part of the chain is null or undefined using the optional chaining operator (?), and sanitizes the string with .trim() only if the preceding chain is a valid string
  //   console.timeEnd('AI Query Time');

  // ********** ********** ********** ********** ********** ********** ********** ********** ********** **********
  // HARD CODED aiQuery SQL QUERY TO AVOID QUERYING openai, REMOVE WHEN INTERACTING WITH openai
  // ********** ********** ********** ********** ********** ********** ********** ********** ********** **********

    const aiQuery = `SELECT exercises.* FROM exercises WHERE exercises.id ILIKE '%squat%' OR exercises.id ILIKE '%curl%'`

    if (!aiQuery) {
      return next({
        log: 'openAIQuery: OpenAI did not return a completion',
        status: 500,
        message: { err: 'Failed to generate SQL query from OpenAI' },
      });
    }

    const aiQueryWithLimit = `${aiQuery} LIMIT $1;`; // limit query with LIMIT clause and a parameter for a value
    // console.log('openaiController aiQueryWithLimit: ', aiQueryWithLimit);
    
    res.locals.aiQueryWithLimit = aiQueryWithLimit;

    // console.log('openAIQuery aiQueryWithLimit: ', aiQueryWithLimit);
    // console.log('openaiController.openAIQuery END');
    console.timeEnd('openaiController.openAIQuery');

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
  // console.log('openaiController.openAIResponse START');
  console.time('openaiController.openAIResponse');

  const { aiQueryWithLimit, supabaseQueryResult, userQuery } = res.locals;

  console.log('openAIResponse supabaseQueryResult: ', supabaseQueryResult);

  if (!aiQueryWithLimit) {
    const error = {
      log: 'openAIResponse: Missing aiQueryWithLimit in res.locals',
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

  // ********** ********** ********** ********** ********** ********** ********** ********** ********** **********
  // COMMENTED OUT openai INTERACTING CODE AND HARD CODED exerciseRecommendation TO AVOID QUERYING openai, CODE HAS OTHERWISE BEEN TESTED AND FUNCTIONS AS AN MVP
  // ********** ********** ********** ********** ********** ********** ********** ********** ********** **********
    
  //   const response = await openai.chat.completions.create({
  //     model: 'gpt-4o-mini',
  //     messages: [
  //       {
  //         role: 'system',
  //         content: `Reply in the first person with a helpful, friendly, assistive, and casually professional personality.
  //         Unless you can infer the user's fitness or experience level with regards to exercise, start with the assumption that the user is a novice or beginner; you are aiding this person in developing a list of exercises and workouts.
  //         You will receive information from this person regarding what they are hoping to accomplish, what activity or sport they want to prepare for, what their goals are, or some similar variation.
  //         They searched: ${userQuery}, and the database returned these results: ${JSON.stringify(supabaseQueryResult, null, 2)}; you are to prioritize the user's goals, fitness level, or activity type as interpretted from their search for the following:
  //         - Choose up to 3 of the most relevant results and, in 2-3 sentences each, explain how each exercise will help the user achieve their goals; reference specific muscles, fitness goals, or activity needs the user has mentioned.
  //         - Summarize how the selected exercises, as a whole, relate to the user's search in at most 5 sentences, highlighting how they complement each other and support the user's intent.
  //         - Conclude with a confidence percentage (e.g., "I’m 90% confident this workout plan aligns with your goals") to reflect how well the exercises fit the user’s needs.`
  //       },
  //     ],
  //   });

  //   const exerciseRecommendation = response?.choices?.[0]?.message?.content?.trim();

  // ********** ********** ********** ********** ********** ********** ********** ********** ********** **********
  // HARD CODED exerciseRecommendation TO AVOID QUERYING openai, REMOVE WHEN INTERACTING WITH openai
  // ********** ********** ********** ********** ********** ********** ********** ********** ********** **********

    const exerciseRecommendation = `THIS IS A PLACEHOLDER FOR openai's RESPONSE WHILE THE ACTUAL MVP CODE IS COMMENTED OUT`

    if (!exerciseRecommendation) {
      return next({
        log: 'openAIResponse: OpenAI did not return a completion',
        status: 500,
        message: { err: 'An error occurred while querying OpenAI' },
      });
    }

    res.locals.exerciseRecommendation = exerciseRecommendation;

    // console.log('openaiController.openAIResponse END');
    console.timeEnd('openaiController.openAIResponse');

    return next();
  } catch (err) {
    return next({
      log: `openAIResponse: OpenAI API error: ${err.message}`,
      status: 500,
      message: { err: 'An error occurred while querying OpenAI' },
    });
  }
};
