import { getConnection } from "typeorm";

export default async () => {
  console.log("Tearing down...");
  await getConnection().close();
};
