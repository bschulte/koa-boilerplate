#!/usr/bin/env ts-node
import { existsSync, writeFileSync, mkdirSync } from "fs";
import prompts, { PromptObject } from "prompts";
import pluralize from "pluralize";

export const cliBootstrap = async () => {
  const questions: PromptObject[] = [
    {
      type: "text",
      name: "name",
      message: "Uppercase, camel-cased class name for module"
    },
    {
      type: "text",
      name: "fileName",
      message: "Name to use for files (lowercase, hyphenated)"
    }
  ];

  const nameResponse = await prompts(questions);

  const response = await prompts({
    type: "confirm",
    name: "shouldAddDataTypes",
    message: "Add a column to the entity?",
    initial: true
  });

  const columns: Array<{ name: string; type: string }> = [];

  if (response.shouldAddDataTypes) {
    let columnResponse;
    do {
      columnResponse = await prompts([
        { type: "text", name: "name", message: "Column name:" },
        {
          type: "select",
          name: "type",
          message: "Data type",
          choices: [
            { title: "String", value: "string" },
            { title: "Number", value: "number" },
            { title: "Date", value: "Date" }
          ]
        },
        {
          type: "confirm",
          name: "addAnother",
          message: "Add another?",
          initial: true
        }
      ]);

      columns.push({
        name: columnResponse.name,
        type: columnResponse.type
      });
    } while (columnResponse.addAnother);
  }

  _bootstrapModule(nameResponse.name, nameResponse.fileName, columns);
};

const _safeWrite = (file: string, data: string) => {
  if (existsSync(file)) {
    console.log("Ignoring file, exists already:", file);
    return;
  }

  writeFileSync(file, data);
};

const _bootstrapModule = (
  name: string,
  fileName: string,
  columns: Array<{ name: string; type: string }>
) => {
  console.log("Bootstrapping module:", name);
  const varName = name.charAt(0).toLowerCase() + name.slice(1);

  const entity = `
import { ObjectType, Field } from "type-graphql";
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity()
@ObjectType({ description: "${name} entity" })
export default class ${name} {
  @PrimaryGeneratedColumn()
  public id: number;

  ${columns
    .map((column: { name: string; type: string }) => {
      return `
  @Field()
  @Column()
  public ${column.name}: ${column.type}
  `;
    })
    .join("\n")}

  @Field()
  @CreateDateColumn()
  public createdAt: Date;

  @Field()
  @UpdateDateColumn()
  public updatedAt: Date;
}`;

  const service = `
import { getRepository, Repository } from "typeorm";

import ${name} from "./${fileName}.entity";
import { Service } from "typedi";
import { OrmRepository } from "typeorm-typedi-extensions";

import { ${name}Input } from "./dtos/${name}Input";

@Service()
export class ${name}Service {
  @OrmRepository(${name}) private repo: Repository<${name}>;

  public async findOneById(${varName}Id: number) {
    return await this.repo.findOne({ id: ${varName}Id });
  }

  public async findAll() {
    return await this.repo.find();
  }

  public async create(${varName}Input: ${name}Input) {
    const new${name} = this.repo.create(${varName}Input);
    await this.save(new${name});

    return await new${name};
  }

  public async update(id: number, ${varName}Input: ${name}Input) {
    await this.repo.update(id, ${varName}Input);

    return await this.findOneById(id);
  }

  public async save(${varName}: ${name}) {
    await this.repo.save(${varName});
    return ${varName};
  }
}
`;

  const resolver = `import { Resolver, Query, Arg, Mutation, Authorized, Ctx } from "type-graphql";
import { Inject } from "typedi";

import { ${name}Input } from "./dtos/${name}Input";
import ${name} from "./${fileName}.entity";
import { ${name}Service } from "./${fileName}.service";

@Resolver(${name})
export class ${name}Resolver {
  @Inject() private ${varName}Service: ${name}Service;

  @Query(() => ${name})
  @Authorized()
  public async ${varName}(@Ctx() ctx: any, @Arg("id") id: number) {
    return this.${varName}Service.findOneById(id);
  }

  @Query(() => [${name}])
  @Authorized()
  public async ${pluralize(varName)}() {
    return this.${varName}Service.findAll();
  }

  @Mutation(() => ${name})
  @Authorized()
  public async create${name}(@Arg("${varName}Input") ${varName}Input: ${name}Input) {
    return this.${varName}Service.create(${varName}Input);
  }

  @Mutation(() => ${name})
  @Authorized()
  public async update${name}(@Arg("id") id: number, @Arg("${varName}Input") ${varName}Input: ${name}Input) {
    return this.${varName}Service.update(id, ${varName}Input);
  }
}
`;

  const controller = `import { Context } from "koa";
import {
  JsonController,
  Post,
  BodyParam,
  Ctx,
  Get,
  Put,
  Param,
  Body
} from "routing-controllers";
import { Inject } from "typedi";

import { StatusCode } from "../../common/constants";
import { Logger } from "../../logging/Logger";
import { ${name}Service } from "./${fileName}.service";
import { ${name}Input } from "./dtos/${name}Input";

@JsonController("/${fileName}")
export class ${name}Controller {
  private logger = new Logger(${name}Controller.name);
  @Inject() private ${varName}Service: ${name}Service;

  @Get("/:id")
  public async get${name}(@Param("id") id: number) {
    return await this.${varName}Service.findOneById(id);
  }

  @Post("/")
  public async create${name}(
    @Body() ${varName}Input: ${name}Input,
    @Ctx() ctx: Context
  ) {
    await this.${varName}Service.create(${varName}Input);

    ctx.status = StatusCode.ACCEPTED;
    return { success: true };
  }

  @Put("/:id")
  public async update${name}(
    @Body() ${varName}Input: ${name}Input,
    @Param("id") id: number,
    @Ctx() ctx: Context
  ) {
    await this.${varName}Service.update(
      id,
      ${varName}Input
    );

    ctx.status = StatusCode.ACCEPTED;
    return { success: true };
  }
}
`;

  const inputClass = `import { ObjectType, Field, InputType } from "type-graphql";

  @ObjectType()
  @InputType('${name}Input')
  export class ${name}Input {
  ${columns
    .map((column: { name: string; type: string }) => {
      return `
  @Field()
  public ${column.name}: ${column.type}
  `;
    })
    .join("\n")}
}
`;

  const spec = `import * as ${varName}Service from "./${fileName}.service";

describe("${fileName}", () => {
  test("should do something", async () => {
    jest
      .spyOn(${varName}Service, "findOneById")
      .mockImplementation(() => null);

    const result = await ${varName}Service.findOneById(1);
    expect(true).toBe(true);
  });
});
`;

  const e2e = `import createTestClient from "../utils/mock-apollo";
import { bootstrap, reloadMockData } from "../../bootstrap-db";
import { getConnection } from "typeorm";
import * as ${varName}Service from "../../modules/${fileName}/${fileName}.service";

describe("${fileName} resolver e2e", () => {
  let testClient;

  beforeEach(async () => {
    await bootstrap();
    await reloadMockData();
    testClient = await createTestClient();
  });

  afterEach(async () => {
    await getConnection().close();
  });

  test("something should happen", async () => {
    expect(true).toBe(true);
  });
});
`;

  const MODULES_PATH = __dirname + "/../../src/modules";
  const E2E_PATH = __dirname + "/../../src/testing/e2e";

  if (!existsSync(`${MODULES_PATH}/${fileName}`)) {
    mkdirSync(`${MODULES_PATH}/${fileName}`);
  }

  if (!existsSync(`${MODULES_PATH}/${fileName}/dtos`)) {
    mkdirSync(`${MODULES_PATH}/${fileName}/dtos`);
  }

  // Entity
  _safeWrite(`${MODULES_PATH}/${fileName}/${fileName}.entity.ts`, entity);
  // Service
  _safeWrite(`${MODULES_PATH}/${fileName}/${fileName}.service.ts`, service);
  // Resolver
  _safeWrite(`${MODULES_PATH}/${fileName}/${fileName}.resolver.ts`, resolver);
  // Controller
  _safeWrite(
    `${MODULES_PATH}/${fileName}/${fileName}.controller.ts`,
    controller
  );
  // Input class
  _safeWrite(`${MODULES_PATH}/${fileName}/dtos/${name}Input.ts`, inputClass);
  // Spec test
  _safeWrite(`${MODULES_PATH}/${fileName}/${fileName}.spec.ts`, spec);
  // E2E test
  _safeWrite(`${E2E_PATH}/${fileName}.e2e.ts`, e2e);
};
