#!/usr/bin/env ts-node
import { existsSync, writeFileSync, exists, mkdirSync } from "fs";

const name = process.argv[2];
const lowercaseName = name.charAt(0).toLowerCase() + name.slice(1);

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
import User from "../user/user.entity";
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity()
@ObjectType({ description: "${name} model" })
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

const service = `import ${name} from "./${lowercaseName}.model";

class ${name}Service {
  public async findOneById(${lowercaseName}Id: number): Promise<${name}> {
    return await ${name}.findOne({ where: { id: ${lowercaseName}Id } });
  }
}

export const ${lowercaseName}Service = new ${name}Service();
`;

const resolver = `import { Resolver, Query, Arg, Mutation, Authorized, Ctx } from "type-graphql";

import ${name} from "./${lowercaseName}.model";
import { ${lowercaseName}Service } from "./${lowercaseName}.service";
import { ADMIN } from "../../security/authChecker";

@Resolver(${name})
export class ${name}Resolver {
  @Query(() => ${name})
  @Authorized()
  public async ${lowercaseName}(@Ctx() ctx: any) {
    console.log("ctx:", ctx);
    return ${lowercaseName}Service.findOneById(ctx.user.id);
  }
}`;

const MODULES_PATH = __dirname + "/../src/modules";

if (!existsSync(`${MODULES_PATH}/${lowercaseName}`)) {
  mkdirSync(`${MODULES_PATH}/${lowercaseName}`);
}

// Model
safeWrite(`${MODULES_PATH}/${lowercaseName}/${lowercaseName}.model.ts`, entity);
// Service
safeWrite(
  `${MODULES_PATH}/${lowercaseName}/${lowercaseName}.service.ts`,
  service
);
// Resolver
safeWrite(
  `${MODULES_PATH}/${lowercaseName}/${lowercaseName}.resolver.ts`,
  resolver
);
