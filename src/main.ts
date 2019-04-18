import createApp from "./app";
import { bootstrap } from "./bootstrap-db";
import { Logger } from "./logging/Logger";

(async () => {
  const { PORT = 5000 } = process.env;
  const logger = new Logger("Main.ts");

  try {
    // Setup DB connection
    await bootstrap();

    // Create the app
    const app = await createApp();

    app.listen({ port: PORT }, () => {
      logger.info(`App listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error("Error starting server:");
    logger.error(err);
    process.exit(-1);
  }
})();
