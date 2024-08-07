import { DMMF } from '@prisma/generator-helper';
import _ from 'lodash';

class Model {
  readonly scalars: DMMF.Field[];
  readonly foreignKeys: string[];
  readonly scalarsRequiredForCreation: DMMF.Field[];
  readonly objectsRequiredForCreation: DMMF.Field[];
  readonly name: string;

  constructor(dmmf_model: DMMF.Model) {
    this.name = dmmf_model.name;
    this.scalars = dmmf_model.fields.filter((field) => field.kind === 'scalar');
    this.foreignKeys = dmmf_model.fields.flatMap((field) => field.relationFromFields || []);

    this.scalarsRequiredForCreation = this.scalars.filter(
      (field) => field.isRequired && !field.hasDefaultValue && !this.foreignKeys.includes(field.name),
    );

    this.objectsRequiredForCreation = dmmf_model.fields.filter(
      (field) => field.kind === 'object' && !field.isList && field.isRequired,
    );
  }
}

class PrismaFakerGenerator {
  models: Model[];

  readonly scalarMap: Record<string, string> = {
    Int: 'faker.number.int({ max: 1000 })',
    BigInt: 'faker.number.bigInt()',
    Float: 'faker.number.float()',
    String: 'faker.string.sample()',
    DateTime: 'faker.date.anytime ()',
    Decimal: 'new Prisma.Decimal(faker.number.float())',
    Boolean: 'faker.datatype.boolean()',
    Json: '{}',
  };

  constructor(models: DMMF.Model[]) {
    this.models = models.map((dmmfModel) => new Model(dmmfModel));
  }

  generate(): string {
    return [this.header, this.generateBody(), this.footer].join('\n\n');
  }

  readonly header = `import { faker } from '@faker-js/faker';
import * as prisma from '@prisma/client';
import { Prisma } from '@prisma/client';

export default class prisma_faker {`;

  private generateBody(): string {
    return `${this.generateDatabaseFaker()}

${this.generateTypescriptFaker()}`;
  }

  readonly footer = `}`;

  //General////////////////////////////////////////////////////////////////////

  generateScalarFaker(field: DMMF.Field): string {
    if (field.isList) {
      return '[]';
    }
    return `${this.scalarMap[field.type]}`;
  }

  generateScalarFieldFaker(field: DMMF.Field): string {
    return `    ${field.name}: ${this.generateScalarFaker(field)},`;
  }

  //Typescript/////////////////////////////////////////////////////////////////
  private generateTypescriptFaker(): string {
    const typescriptModelFakers = this.models.map((model) => this.generateTypescriptModelFaker(model)).join('\n\n');

    const fakersExport = this.models.map((model) => `    ${model.name}: prisma_faker.${model.name}_faker,`);

    const typescriptFakersCollection = `
  static readonly typescript = {
${fakersExport.join('\n')}
  };`;
    return [typescriptModelFakers, typescriptFakersCollection].join(`\n`);
  }

  private generateTypescriptModelFaker(model: Model): string {
    const signature = `  static readonly ${model.name}_faker = (partial_${model.name}?: Partial<prisma.${model.name}>): prisma.${model.name} => ({`;

    const fields = model.scalars.map((field) => this.generateScalarFieldFaker(field));

    const footer = `    ...partial_${model.name},
  });`;
    return [signature, ...fields, footer].join('\n');
  }

  //Database///////////////////////////////////////////////////////////////////

  generateDatabaseFaker() {
    const dbModelFakers = this.models.map((model) => this.generateDatabaseModelFaker(model)).join(`\n\n`);

    const fakersExport = this.models.map((model) => `    ${model.name}: prisma_faker.${model.name}_faker_db,`);

    const dbFakersCollection = `
  static readonly db = {
${fakersExport.join('\n')}
  };`;
    return [dbModelFakers, dbFakersCollection].join(`\n`);
  }

  generateDatabaseModelFaker(model: Model): any {
    const signature = `  static readonly ${model.name}_faker_db = (partial_${model.name}?: Partial<Prisma.${model.name}CreateInput>): Prisma.${model.name}CreateInput => ({`;

    const requiredScalars = model.scalarsRequiredForCreation.map((field) => this.generateScalarFieldFaker(field));

    const requiredObjects = model.objectsRequiredForCreation.map(
      (field) => `    ${field.name}: { create: prisma_faker.${field.type}_faker_db()},`,
    );

    const footer = `    ...partial_${model.name},
  });`;
    return [signature, ...requiredObjects, ...requiredScalars, footer].join(`\n`);
  }
}

export function generatePrismaFaker(models: DMMF.Model[]): string {
  const generator = new PrismaFakerGenerator(models);
  return generator.generate();
}
