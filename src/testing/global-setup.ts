import { bootstrap } from "../bootstrap-db";

export default async () => {
  console.log("Setting up test environment");

  await bootstrap();
};
