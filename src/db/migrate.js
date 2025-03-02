const { drizzle } = require("drizzle-orm/postgres-js");
const { migrate } = require("drizzle-orm/postgres-js/migrator");
const postgres = require("postgres");

const runMigration = async () => {
  // TODO: extract this to env var or other configuration option
  // normally having this connection string in the code would be enough to
  // ring lots of alarm bells since it's got a password sitting right there in
  // plain text, but it's just a password for a locally running dev database
  // and the string is committed to the repo history anyways in the .env file,
  // so gonna just leave this so can experiment with migrations if needed.
  const databaseUrl = 'postgresql://postgres:password@localhost/solaceassignment';
  if (!databaseUrl) throw new Error("DATABASE_URL is not set");

  console.log(databaseUrl);

  const sql = postgres(databaseUrl, { max: 1 });
  const db = drizzle(sql);
  await migrate(db, { migrationsFolder: "drizzle" });
  await sql.end();
};

runMigration()
  .then(() => {
    console.log("Successfully ran migration.");

    process.exit(0);
  })
  .catch((e) => {
    console.error("Failed to run migration.");
    console.error(e);

    process.exit(1);
  });
