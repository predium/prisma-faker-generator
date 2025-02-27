import { generatorHandler, GeneratorOptions } from '@prisma/generator-helper';
import * as fs from 'fs';
import { logger } from '@prisma/internals';
import path from 'path';
import { GENERATOR_NAME } from './constants';
import { generatePrismaFaker } from './helpers/generatePrismaFaker';
import { getMapperOptions } from './helpers/generatorUtils';

const { version } = require('../package.json');

generatorHandler({
  onManifest() {
    logger.info(`${GENERATOR_NAME}:Registered`);
    return {
      version,
      defaultOutput: '../generated',
      prettyName: GENERATOR_NAME,
    };
  },
  onGenerate: async (options: GeneratorOptions) => {
    const faker = generatePrismaFaker(options.dmmf.datamodel.models, getMapperOptions(options.generator.config));

    const writeLocation = path.join(options.generator.output?.value!, 'faker.ts');

    await fs.promises.mkdir(path.dirname(writeLocation), {
      recursive: true,
    });

    await fs.promises.writeFile(writeLocation, faker);
  },
});
