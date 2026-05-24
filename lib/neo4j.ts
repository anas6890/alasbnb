import neo4j, { Driver } from "neo4j-driver";

const URI = process.env.NEO4J_URI || "neo4j://localhost:7687";
const USER = process.env.NEO4J_USER || "neo4j";
const PASSWORD = process.env.NEO4J_PASSWORD || "password";

let driver: Driver;

if (process.env.NODE_ENV === "production") {
  driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
} else {
  if (!(global as any).neo4jDriver) {
    (global as any).neo4jDriver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
  }
  driver = (global as any).neo4jDriver;
}

export default driver;
