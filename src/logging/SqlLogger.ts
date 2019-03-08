import { Logger } from "typeorm";
import { Logger as FileLogger } from "./Logger";

export class SqlLogger implements Logger {
  private logger: FileLogger;

  constructor() {
    this.logger = new FileLogger(SqlLogger.name);
  }

  public logQuery(query: string, parameters: any[] = []) {
    this.logger.sqlLog(
      `Query: ${query}, Parameters: [${parameters.join(", ")}]`
    );
  }

  public logQueryError(error: string, query: string, parameters: any[] = []) {
    this.logger.sqlLog(
      `ERROR: ${error}\nQuery: ${query}\nParameters: [${parameters.join(", ")}]`
    );
  }

  public logQuerySlow(time: number, query: string, parameters: any[] = []) {
    this.logger.sqlLog(
      `[SLOW QUERY] Execution time: ${time}\nQuery: ${query}\nParameters: [${parameters.join(
        ", "
      )}]`
    );
  }

  public logSchemaBuild(message: string) {
    this.logger.sqlLog(message);
  }

  public logMigration(message: string) {
    this.logger.sqlLog(message);
  }

  public log(level: "log" | "info" | "warn", message: any) {
    this.logger.sqlLog(`[${level.toUpperCase()}] ${message}`);
  }
}
