import { Logger } from "typeorm";
import { sqlLog } from "./logger";

export class SqlLogger implements Logger {
  public logQuery(query: string, parameters: any[] = []) {
    sqlLog(`Query: ${query}, Parameters: [${parameters.join(", ")}]`);
  }

  public logQueryError(error: string, query: string, parameters: any[] = []) {
    sqlLog(
      `ERROR: ${error}\nQuery: ${query}\nParameters: [${parameters.join(", ")}]`
    );
  }

  public logQuerySlow(time: number, query: string, parameters: any[] = []) {
    sqlLog(
      `[SLOW QUERY] Execution time: ${time}\nQuery: ${query}\nParameters: [${parameters.join(
        ", "
      )}]`
    );
  }

  public logSchemaBuild(message: string) {
    sqlLog(message);
  }

  public logMigration(message: string) {
    sqlLog(message);
  }

  public log(level: "log" | "info" | "warn", message: any) {
    sqlLog(`[${level.toUpperCase()}] ${message}`);
  }
}
