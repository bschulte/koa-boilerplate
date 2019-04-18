#!/usr/bin/env ts-node
import "reflect-metadata";

import minimist from "minimist";
import chalk from "chalk";
import * as _ from "lodash";

import { FINAL_CMD, cmds, IOption } from "./cli/cmdDefs";
import { bootstrap } from "../src/bootstrap-db";

const argv = minimist(process.argv.slice(2));

const printCommandList = (currentTree: any) => {
  console.log("Available options:");
  Object.keys(currentTree).forEach((cmd: string) => {
    console.log("-", chalk.yellow(cmd));
  });
};

const printRequiredOption = (options: IOption[]) => {
  options
    .filter((opt: IOption) => opt.required)
    .forEach((opt: IOption) => {
      printOption(opt);
    });
};

const printOption = (option: IOption) => {
  console.log(`-  ${option.name}${option.alias ? ` , ${option.alias}` : ""}`);
  if (option.description) {
    console.log(`  ${option.description}`);
  }
};

export const getOptionValue = (argv: any, name: string, alias: string = "") => {
  if (argv[name]) {
    return argv[name];
  }
  if (alias && argv[alias]) {
    return argv[alias];
  }

  return false;
};

// For the final sub command, verify that any of the required options are there
const verifyOptions = (argv: any, options: IOption[]) => {
  if (!options) {
    return;
  }

  for (const option of options) {
    if (option.required) {
      // Check that either the name or its alias is present in the argv object
      const optionValue = getOptionValue(argv, option.name, option.alias);
      if (!optionValue) {
        console.log(
          chalk.red("Error:"),
          `Missing required argument: ${option.name}`
        );
        console.log("Required options:");
        printRequiredOption(options);
        process.exit(-3);
      }

      // Check that the type of the provided value for the option is the expected one
      if (typeof optionValue !== option.type) {
        console.log(
          `Please provide the proper type for the option: -${option.name}`
        );
        console.log(`Type required: ${option.type}`);
        process.exit(-4);
      }
    }
  }
};

// Recursively run through the commands in the argv array to see what final
// sub command should be executed
// It will iterate through a command like: "user create -e test@gmail.com"
// by going through user -> create -> finding that create is the last command it'll
// check the options provided and then run the handler function
const runCmd = async (
  currentCmd: string,
  currentTree: any, // Current view of the defined command structure tree
  commandArgs: string[]
) => {
  if (
    _.get(currentTree, `${currentCmd}.type`) &&
    currentTree[currentCmd].type === FINAL_CMD
  ) {
    verifyOptions(argv, currentTree[currentCmd].options);
    await currentTree[currentCmd].handler(argv);
  } else {
    // Check to make sure the user entered a sub command
    const nextCmd = commandArgs[0];
    if (!nextCmd) {
      console.log(chalk.red("Error:"), "Please enter a command");
      printCommandList(
        currentTree[currentCmd] ? currentTree[currentCmd] : currentTree
      );
      process.exit(-2);
    }

    await runCmd(nextCmd, currentTree[currentCmd], commandArgs.slice(1));
  }
};

(async () => {
  // Initialize the database connection
  await bootstrap();

  const commandArgs = argv._;

  if (commandArgs.length === 0) {
    console.log(
      chalk.red("Error:"),
      "Please enter a command, available commands:"
    );
    printCommandList(cmds);
    process.exit(-1);
  }

  await runCmd(commandArgs[0], cmds, commandArgs.slice(1));
  process.exit();
})();
