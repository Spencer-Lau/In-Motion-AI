export const goldenDataset = [
  {
    testInput: ``,
    expectedRecommendations: ['', '', ''],
  },
  {
    testInput: ``,
    expectedRecommendations: ['', '', ''],
  },
];

export const testGoldenDataset = async (req, res, next) => {
  const { userQuery, supabaseQueryResult } = res.locals;
  console.log('userQuery: ', userQuery);
  console.log('goldenDataset.testInput: ', goldenDataset[0].testInput);

  // find the object in goldenDataset with a summary matching the userQuery
  const goldenTestData = goldenDataset.find((dataEntry) =>
    userQuery.includes(dataEntry.testInput)
  );

  if (!goldenTestData) {
    const error = {
      log: 'testGoldenDataset: Unable to find matching goldenTestData',
      status: 500,
      message: { err: 'No matching entry in the golden dataset found for the aiQuery' },
    };
    return next(error);
  }

  const supabaseRecommendations =
    supabaseQueryResult?.map((record) => record.metadata.title) || [];

  const correctRecommendations = supabaseRecommendations?.filter((title) =>
    goldenTestData.expectedRecommendations.includes(title)
  );

  const precision = supabaseRecommendations.length
    ? (correctRecommendations.length / supabaseRecommendations.length) * 100
    : 0;

  console.log('precision: ', precision);
  console.log('supabaseRecommendations: ', supabaseRecommendations);
  console.log('correctRecommendations: ', correctRecommendations);

  return next();
};
