import { GeneratorOptions } from '@prisma/generator-helper';
import { logger } from '@prisma/internals';

export function getMapperOptions(config: GeneratorOptions['generator']['config']) {
  const mapper = config.mapper;
  if (mapper) {
    if (!(mapper instanceof Array)) {
      throw new Error(`Mapper is not an array`);
    }

    const parsedMapper: { regex: string; faker: string }[] = mapper.map((m) => {
      const split = m.split('->');
      if (split.length !== 2) {
        throw new Error(`Mapper is not in the correct format. Could not parse ${m}`);
      }
      const [regex, faker] = split;
      return { regex, faker };
    });

    logger.info(`Mapper found. Parsed ${parsedMapper.length} mappings`);
    return parsedMapper;
  }
}
