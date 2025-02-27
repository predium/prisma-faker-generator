import { getConfig, getDMMF } from '@prisma/internals';
import { generatePrismaFaker } from '../helpers/generatePrismaFaker';
import { getMapperOptions } from '../helpers/generatorUtils';

it('should work on a simple model', async () => {
  const datamodel = `
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  email     String   @unique
  name      String?
  hashedPassword Bytes?
  posts     Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  published Boolean  @default(false)
  title     String   @db.VarChar(255)
  author    User?    @relation(fields: [authorId], references: [id])
  authorId  Int?
}
`;

  const dmmf = await getDMMF({ datamodel });
  const result = generatePrismaFaker(dmmf.datamodel.models);

  expect(result).toMatchSnapshot();
});

describe('Mapper', () => {
  it('should work when the mapper is missing', async () => {
    const datamodel = `
datasource db {
  provider = "postgresql"
  url      = "postgresql://localhost:5432"
}

generator faker {
  provider = "prisma-faker-generator"
  output   = "../src/utils/testing"
  mapper   = ["Book.id->faker.number.int()", ".*\.id->faker.string.uuid()"]
}

model User {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  email     String   @unique
  name      String?
  posts     Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  published Boolean  @default(false)
  title     String   @db.VarChar(255)
  author    User?    @relation(fields: [authorId], references: [id])
  authorId  Int?
}
`;

    const dmmf = await getDMMF({ datamodel });
    const configs = await getConfig({ datamodel });
    const result = generatePrismaFaker(dmmf.datamodel.models, getMapperOptions(configs.generators[0].config));

    expect(result).toMatchSnapshot();
  });

  it('should generate custom map fields', async () => {
    const datamodel = `
generator faker {
  provider = "prisma-faker-generator"
  output   = "../src/utils/testing"
  mapper   = ["Book.id->faker.number.int()", ".*\.id->faker.string.uuid()"]
}

datasource db {
  provider = "postgresql"
  url      = "postgresql://localhost:5432"
}

model Book {
    id                    String                      @unique
}

model User {
    id                    String                      @db.Uuid @unique
}`;

    const dmmf = await getDMMF({ datamodel });
    const configs = await getConfig({ datamodel });
    const mapper = getMapperOptions(configs.generators[0].config);
    const result = generatePrismaFaker(dmmf.datamodel.models, mapper);

    expect(result).toMatchSnapshot();
  });
});
