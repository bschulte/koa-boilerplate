#!/usr/bin/env ts-node
import { existsSync, writeFileSync, exists, mkdirSync } from "fs";

if (process.argv.length !== 4) {
  console.log("Please provide both the class name and file name to use");
  process.exit(-1);
}
const name = process.argv[2];
const fileName = process.argv[3];
const varName = name.charAt(0).toLowerCase() + name.slice(1);

console.log("Bootstrapping module:", name);

const safeWrite = (file: string, data: string) => {
  if (existsSync(file)) {
    console.log("Ignoring file, exists already:", file);
    return;
  }

  writeFileSync(file, data);
};

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
  public readonly id: number;

  @Field()
  @CreateDateColumn()
  public createdAt: Date;

  @Field()
  @UpdateDateColumn()
  public updatedAt: Date;
}`;

const service = `import ${name} from "./${fileName}.entity";
import { getRepository, Repository } from "typeorm";

class ${name}Service {
  public async findOneById(${varName}Id: number): Promise<${name}> {
    return await this.repo().findOne(${varName}Id);
  }

  private repo(): Repository<${name}> {
    return getRepository(${name});
  }
}

export const ${varName}Service = new ${name}Service();
`;

const resolver = `import { Resolver, Query, Arg, Mutation, Authorized, Ctx } from "type-graphql";

import ${name} from "./${fileName}.entity";
import { ${varName}Service } from "./${fileName}.service";

@Resolver(${name})
export class ${name}Resolver {
  @Query(() => ${name})
  @Authorized()
  public async ${varName}(@Ctx() ctx: any, @Arg('id') id: number) {
    return ${varName}Service.findOneById(id);
  }
}`;

const controller = `import { Controller, Get } from "routing-controllers";

@Controller()
export class ${name}Controller {
  @Get("/${fileName}")
  public getAll() {
    return "This gets all of these";
  }
}`;

const MODULES_PATH = __dirname + "/../src/modules";

if (!existsSync(`${MODULES_PATH}/${fileName}`)) {
  mkdirSync(`${MODULES_PATH}/${fileName}`);
}

// Entity
safeWrite(`${MODULES_PATH}/${fileName}/${fileName}.entity.ts`, entity);
// Service
safeWrite(`${MODULES_PATH}/${fileName}/${fileName}.service.ts`, service);
// Resolver
safeWrite(`${MODULES_PATH}/${fileName}/${fileName}.resolver.ts`, resolver);
// Controller
safeWrite(`${MODULES_PATH}/${fileName}/${fileName}.controller.ts`, controller);
