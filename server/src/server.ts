import { config } from "./notion-config";
import { columnTypes } from "./notion-column-types";
import http from "http";
import { Client } from "@notionhq/client";

// This is Typescript  interface for the shape of the object we will
// create based on our database to send to the React app
// When the data is queried it will come back in a much more complicated shape, so our goal is to
// simplify it to make it easy to work with on the front end
interface CrewMember {
  name: string;
  ability: string;
  instructions: string;
}

// const { name, text, formula } = columnTypes;

// const dataTypes: string[] {
//   name: name,
//   ability: formula,
//   instructions: text,
// }

// The dotenv library will read from your .env file into these values on `process.env`
const { databases } = config;
const notionDatabaseId = databases.crew;
const notionSecret = config.notionSecretKey;

// Will provide an error to users who forget to create the .env file
// with their Notion data in it
if (!notionDatabaseId || !notionSecret) {
  throw Error(
    "No keys defined. Define notionSecretKey and database IDs in notion-config.ts"
  );
}

// Initializing the Notion client with your secret
const notion = new Client({
  auth: notionSecret,
});

const host = "localhost";
const port = 8000;

// Require an async function here to support await with the DB query
const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  switch (req.url) {
    case "/":
      // Query the database and wait for the result
      const query = await notion.databases.query({
        database_id: notionDatabaseId,
      });

      const results: any[] = query.results;

      // const list: CrewMember[] = query.results.map((row: any) => {
      //   const name: string = row.properties.Name.title[0].plain_text;
      //   const ability: string = row.properties["Ability text"].formula.string;
      //   let instructions: string = "";
      //   if (row.properties.Instructions.rich_text[0]) {
      //     instructions = row.properties.Instructions.rich_text[0].plain_text;
      //   } else {
      //     instructions = "";
      //   }
      //   return { name, ability, instructions };
      // });

      // We map over the complex shape of the results and return a nice clean array of
      // objects in the shape of our `CrewMember` interface
      const list: CrewMember[] = query.results.map((row: any) => {
        // row represents a row in our database and the name of the column is the
        // way to reference the data in that column
        const nameCell = row.properties.Name;
        const abiltyCell = row.properties["Ability text"];
        const instructionsCell = row.properties.Instructions;

        // Depending on the column "type" we selected in Notion there will be different
        // data available to us (URL vs Date vs text for example) so in order for Typescript
        // to safely infer we have to check the `type` value.  We had one text and one url column.
        const isName = nameCell.type === columnTypes.name.notionPropertyType;
        const isAbility =
          abiltyCell.type === columnTypes.formula.notionPropertyType;
        const isInstructions =
          instructionsCell.type === columnTypes.text.notionPropertyType;

        // Verify the types are correct
        if (isName && isAbility && isInstructions) {
          // Pull the string values from the cells using the columnTypes property paths
          const name = nameCell.title[0].plain_text ?? "";
          const ability = abiltyCell.formula.string ?? "";
          const instructions = instructionsCell.rich_text[0] ? instructionsCell.rich_text[0].plain_text : "";

          // Return it in our `CrewMember` shape
          return { name, ability, instructions };
        }

        // If a row is found that does not match the rules we checked it will still return in the
        // the expected shape but with a NOT_FOUND label
        return {
          name: "NOT_FOUND",
          ability: "NOT_FOUND",
          instructions: "NOT_FOUND",
        };
      });

      res.setHeader("Content-Type", "application/json");
      res.writeHead(200);
      res.end(JSON.stringify(list));
      break;

    default:
      res.setHeader("Content-Type", "application/json");
      res.writeHead(404);
      res.end(JSON.stringify({ error: "Resource not found" }));
  }
});

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
