"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePrismaFaker = void 0;
class Model {
    constructor(dmmf_model) {
        this.name = dmmf_model.name;
        this.scalars = dmmf_model.fields.filter((field) => field.kind === 'scalar');
        this.foreignKeys = dmmf_model.fields.flatMap((field) => field.relationFromFields || []);
        this.scalarsRequiredForCreation = this.scalars.filter((field) => field.isRequired && !field.hasDefaultValue && !this.foreignKeys.includes(field.name));
        this.objectsRequiredForCreation = dmmf_model.fields.filter((field) => field.kind === 'object' && !field.isList && field.isRequired);
    }
}
class PrismaFakerGenerator {
    constructor(models) {
        this.scalarMap = {
            Int: 'faker.datatype.number()',
            BigInt: 'faker.datatype.bigInt()',
            Float: 'faker.datatype.float()',
            String: 'faker.datatype.string()',
            DateTime: 'faker.datatype.datetime()',
            Decimal: 'new Decimal(faker.datatype.number())',
            Boolean: 'faker.datatype.boolean()',
        };
        this.header = `import { faker } from '@faker-js/faker';
import * as prisma from '@prisma/client';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';

export default class prisma_faker {`;
        this.footer = `}`;
        this.models = models.map((dmmfModel) => new Model(dmmfModel));
    }
    generate() {
        return [this.header, this.generateBody(), this.footer].join('\n\n');
    }
    generateBody() {
        return `${this.generateDatabaseFaker()}

${this.generateTypescriptFaker()}`;
    }
    generateScalarFaker(field) {
        if (field.isList) {
            return '[]';
        }
        return `${this.scalarMap[field.type]}`;
    }
    generateScalarFieldFaker(field) {
        return `    ${field.name}: ${this.generateScalarFaker(field)},`;
    }
    generateTypescriptFaker() {
        const typescriptModelFakers = this.models.map((model) => this.generateTypescriptModelFaker(model)).join('\n\n');
        const fakersExport = this.models.map((model) => `    ${model.name}: prisma_faker.${model.name}_faker,`);
        const typescriptFakersCollection = `
  static readonly typescript = {
${fakersExport.join('\n')}
  };`;
        return [typescriptModelFakers, typescriptFakersCollection].join(`\n`);
    }
    generateTypescriptModelFaker(model) {
        const signature = `  static readonly ${model.name}_faker = (partial_${model.name}?: Partial<prisma.${model.name}>): prisma.${model.name} => ({`;
        const fields = model.scalars.map((field) => this.generateScalarFieldFaker(field));
        const footer = `    ...partial_${model.name},
  });`;
        return [signature, ...fields, footer].join('\n');
    }
    generateDatabaseFaker() {
        const dbModelFakers = this.models.map((model) => this.generateDatabaseModelFaker(model)).join(`\n\n`);
        const fakersExport = this.models.map((model) => `    ${model.name}: prisma_faker.${model.name}_faker_db,`);
        const dbFakersCollection = `
  static readonly db = {
${fakersExport.join('\n')}
  };`;
        return [dbModelFakers, dbFakersCollection].join(`\n`);
    }
    generateDatabaseModelFaker(model) {
        const signature = `  static readonly ${model.name}_faker_db = (partial_${model.name}?: Partial<Prisma.${model.name}CreateInput>): Prisma.${model.name}CreateInput => ({`;
        const requiredScalars = model.scalarsRequiredForCreation.map((field) => this.generateScalarFieldFaker(field));
        const requiredObjects = model.objectsRequiredForCreation.map((field) => `    ${field.name}: { create: prisma_faker.${field.type}_faker_db()},`);
        const footer = `    ...partial_${model.name},
  });`;
        return [signature, ...requiredObjects, ...requiredScalars, footer].join(`\n`);
    }
}
function generatePrismaFaker(models) {
    const generator = new PrismaFakerGenerator(models);
    return generator.generate();
}
exports.generatePrismaFaker = generatePrismaFaker;
//# sourceMappingURL=generatePrismaFaker.js.map