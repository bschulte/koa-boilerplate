import { format, createLogger, transports, info } from "winston";
import { TransformableInfo } from "logform";

export const DEBUG = "debug";
export const INFO = "info";
export const WARN = "warn";
export const ERROR = "error";

type LogLevel = "debug" | "info" | "warn" | "error";

const myFormat = format.printf((info: TransformableInfo) => {
  return `${info.timestamp} [${info.level}] ${info.message}`;
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

export const log = (level: LogLevel, message: string, ...other: any[]) => {
  logger.log(level, `${message} ${other.length > 0 && JSON.stringify(other)}`);
};

export const sqlLog = (message: string) => {
  sqlLogger.log(DEBUG, message);
};
