import { getSampleDMMF } from './__fixtures__/getSampleDMMF';
import { generatePrismaFaker } from '../helpers/generatePrismaFaker';

test('Faker Generation', async () => {
  const sampleDMMF = await getSampleDMMF();
  expect(generatePrismaFaker(sampleDMMF.datamodel.models)).toMatchSnapshot('fullSample');
});
