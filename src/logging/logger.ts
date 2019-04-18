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

export class Logger {
  // Used to calculate the time between log messages
  private static lastMessageTimestamp = new Date().getTime();

  private myFormat = format.printf((info: TransformableInfo) => {
    return `${moment(info.timestamp).format("L LTS")} ${als.get("requestId") ||
      "-"} ${als.get("user") || "-"} [${info.level}] [${chalk.magenta(
      this.name
    )}] ${info.message} ${chalk.blue(`+${this.getTimeDiff()}ms`)}`;
  });

  private myUncoloredFormat = format.printf((info: TransformableInfo) => {
    const self = this;
    return `${moment(info.timestamp).format("L LTS")} ${als.get("requestId") ||
      "-"} ${als.get("user") || "-"} [${info.level}] [${this.name}] ${
      info.message
    } +${this.getTimeDiff()}ms`;
  });

  private logger = createLogger({
    level: "silly",
    transports: this.createTransports()
  });

  private sqlLogger = createLogger({
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

  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  public debug(message: string) {
    this.log(DEBUG, message);
  }

  public info(message: string) {
    this.log(INFO, message);
  }

  public warn(message: string) {
    this.log(WARN, message);
  }

  public error(message: string) {
    this.log(ERROR, message);
  }

  public write(message: string) {
    this.log(INFO, message);
  }

  public sqlLog(message: string) {
    this.sqlLogger.log(DEBUG, message);
  }

  private log(level: LogLevel, message: string) {
    if (typeof message === "object") {
      this.logger.log(level, `${JSON.stringify(message).replace("\n", "")}`);
    } else {
      this.logger.log(level, `${message.replace("\n", "")}`);
    }
    if (level === "error") {
      console.log(message);
    }

    Logger.lastMessageTimestamp = new Date().getTime();
  }

  private getTimeDiff() {
    return new Date().getTime() - Logger.lastMessageTimestamp;
  }

  private createTransports() {
    const transportList: any[] = [
      new transports.File({
        filename: `${__dirname}/../../logs/server.log`,
        maxFiles: 20,
        maxsize: 1024 * 1000 * 5, // 5MB
        format: format.combine(format.timestamp(), this.myUncoloredFormat)
      }),
      new transports.File({
        filename: `${__dirname}/../../logs/server.tail.log`,
        maxFiles: 1,
        maxsize: 1024 * 1000 * 5, // 5MB
        tailable: true,
        format: format.combine(
          format.timestamp(),
          format.colorize(),
          this.myFormat
        )
      })
    ];

    if (process.env.NODE_ENV !== "test") {
      transportList.push(
        new transports.Console({
          format: format.combine(
            format.timestamp(),
            format.colorize(),
            this.myFormat
          )
        })
      );
    }

    return transportList;
  }
}
