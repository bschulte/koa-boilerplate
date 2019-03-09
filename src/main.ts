import app from "./app";
import { bootstrap } from "./bootstrap";
import { Logger } from "./logging/Logger";

(async () => {
  const { PORT = 5000 } = process.env;
  const logger = new Logger("Main.ts");

  try {
    // Setup DB connection
    await bootstrap();

    app.listen({ port: PORT }, () => {
      logger.info(`App listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error("Error starting server:");
    logger.error(err);
    process.exit(-1);
  }
})();
