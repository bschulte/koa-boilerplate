import { format, createLogger, transports, info } from "winston";
import { TransformableInfo } from "logform";
import moment from "moment";
import chalk from "chalk";
import als from "async-local-storage";

const DEBUG = "debug";
const INFO = "info";
const WARN = "warn";
const ERROR = "error";

type LogLevel = "debug" | "info" | "warn" | "error";

const myFormat = format.printf((info: TransformableInfo) => {
  return `${moment(info.timestamp).format("L LTS")} ${als.get("requestId") ||
    "-"} ${als.get("user") || "-"} [${info.level}] ${info.message}`;
});

const logger = createLogger({
  level: "silly",
  transports: [
    new transports.File({
      filename: `${__dirname}/../../logs/server.log`,
      maxFiles: 20,
      maxsize: 1024 * 1000 * 5, // 5MB
      tailable: true,
      format: format.combine(format.timestamp(), myFormat)
    }),
    new transports.Console({
      format: format.combine(format.timestamp(), format.colorize(), myFormat)
    })
  ]
});

const sqlLogger = createLogger({
  level: "silly",
  transports: [
    new transports.File({
      filename: `${__dirname}/../../logs/sql.log`,
      maxFiles: 20,
      maxsize: 1024 * 1000 * 5, // 5MB
      tailable: true
    })
  ]
});

export class Logger {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  public debug(message: string, ...other: any[]) {
    this.log(DEBUG, message, other);
  }

  public info(message: string, ...other: any[]) {
    this.log(INFO, message, other);
  }

  public warn(message: string, ...other: any[]) {
    this.log(WARN, message, other);
  }

  public error(message: string, ...other: any[]) {
    this.log(ERROR, message, other);
  }

  public sqlLog(message: string) {
    sqlLogger.log(DEBUG, message);
  }

  private log(level: LogLevel, message: string, ...other: any[]) {
    logger.log(
      level,
      `[${chalk.magenta(this.name)}] ${message} ${other
        .map((part: any) => JSON.stringify(part))
        .join(", ")}`
    );
  }
}
