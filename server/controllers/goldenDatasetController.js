export const goldenDataset = [
  {
    testInput: `row`,
    expectedRecommendations: ['Alternating_Kettlebell_Row', '', ''],
  },
  {
    testInput: ``,
    expectedRecommendations: ['', '', ''],
  },
];

export const testGoldenDataset = async (req, res, next) => {
  console.log('goldenDatasetController.goldenDataset START');
  console.time('goldenDatasetController.goldenDataset');

  const { userQuery, supabaseQueryResult } = res.locals;
  
  // console.log('userQuery: ', userQuery);
  console.log('goldenDataset.testInput: ', goldenDataset[0].testInput);

  const goldenTestData = goldenDataset.find((dataEntry) => // find the object in goldenDataset with a summary matching the userQuery
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
    supabaseQueryResult?.map((record) => record.id) || [];

  const correctRecommendations = Array.isArray(supabaseRecommendations)
  ? supabaseRecommendations.filter((exercise) => goldenTestData.expectedRecommendations.includes(exercise))
  : [];
  
  const precision = supabaseRecommendations.length
    ? (correctRecommendations.length / supabaseRecommendations.length) * 100
    : 0;

  console.log('precision: ', precision);
  console.log('supabaseRecommendations: ', supabaseRecommendations);
  console.log('correctRecommendations: ', correctRecommendations);

  console.log('goldenDatasetController.goldenDataset END');
  console.timeEnd('goldenDatasetController.goldenDataset');

  return next();
};
