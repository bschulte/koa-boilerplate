#!/usr/bin/env ts-node
import { existsSync, writeFileSync, mkdirSync } from "fs";
import prompts, { PromptObject } from "prompts";

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

  const response = await prompts(questions);
  _bootstrapModule(response.name, response.fileName);
};

const _safeWrite = (file: string, data: string) => {
  if (existsSync(file)) {
    console.log("Ignoring file, exists already:", file);
    return;
  }

  writeFileSync(file, data);
};

const _bootstrapModule = (name: string, fileName: string) => {
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

  @Field()
  @CreateDateColumn()
  public createdAt: Date;

  @Field()
  @UpdateDateColumn()
  public updatedAt: Date;
}`;

  const service = `import ${name} from "./${fileName}.entity";
import { getRepository, Repository } from "typeorm";

export const findOneById = async (${varName}Id: number) => {
  return await _repo().findOne(${varName}Id);
};

const _repo = (): Repository<${name}> => {
  return getRepository(${name});
};
`;

  const resolver = `import { Resolver, Query, Arg, Mutation, Authorized, Ctx } from "type-graphql";

import ${name} from "./${fileName}.entity";
import * as ${varName}Service from "./${fileName}.service";

@Resolver(${name})
export class ${name}Resolver {
  @Query(() => ${name})
  @Authorized()
  public async ${varName}(@Ctx() ctx: any, @Arg("id") id: number) {
    return ${varName}Service.findOneById(id);
  }
}`;

  const controller = `import * as ${varName}Service from "./${fileName}.service";
import Router from "koa-router";
import { Context } from "koa";
import { StatusCode } from "../../common/constants";

const router = new Router();

router.prefix("/${fileName}");

router.get("/", async (ctx: Context, next: any) => {
  ctx.status = StatusCode.ACCEPTED;
});

export const ${varName}Router = router;
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
  // Spec test
  _safeWrite(`${MODULES_PATH}/${fileName}/${fileName}.spec.ts`, spec);
  // E2E test
  _safeWrite(`${E2E_PATH}/${fileName}.e2e.ts`, e2e);
};
