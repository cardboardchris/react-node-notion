import { config } from "./notion-config";
import { notionColumnTypes } from "./notion-column-types";
import http from "http";
import { Client } from "@notionhq/client";

// This is Typescript  interface for the shape of the object we will
// create based on our database to send to the React app
// When the data is queried it will come back in a much more complicated shape, so our goal is to
// simplify it to make it easy to work with on the front end
// interface CrewMember {
//   name: string;
//   ability: string;
//   instructions: string;
// }

interface NotionColumn {
  notionColumnName: string,
  notionColumnType: string,
}

// interface DatabaseCell {
//   columnName: string,
//   cellValue: any,
// }

const notionColumnsToGet: NotionColumn[] = [
  { notionColumnName: "Name", notionColumnType: "name" },
  { notionColumnName: "Ability text", notionColumnType: "formula" },
  { notionColumnName: "Instructions", notionColumnType: "text" }
];

// get our database configuration from notion-config.js
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
      // const list: CrewMember[] = query.results.map((row: any) => {
      const list: any[] = query.results.map((row: any) => {

        // get the actual value we want from each row
        let crewMember: any = {};

        // for each column of our desired columns array,
        // get the plain text data from the matching column in the current row
        notionColumnsToGet.forEach((column: NotionColumn) => {
          // get the notionColumnType of the column
          const notionColumnType = notionColumnTypes.find((columnType: string) => {
            columnType === column.notionColumnType;
          });
          const propertyPath: string = notionColumnType.propertyPath;
          const actualValue: string = row.notionColumnType.propertyPath;
          // add a property to the crewmember object that well be returned in the server response
          crewMember[notionColumnName] = 
        });
          // Return it in our `CrewMember` shape
          return rowData;

        // // for each row, get the cells where the columns we specified
        // // in notionColumnsToGet above intersect with that row.

        // // to do that, map over notionColumnsToGet and generate an object with
        // // a cell name (the same name as the column)
        // // and a cell value (the property of the row that matches the column name)
        // const cells: DatabaseCell[] = notionColumnsToGet.map((column: NotionColumnType) => {
        //   const columnName: string = column.notionColumnName;
        //   const cellValue: any[] = row.properties[column.notionColumnName];
        //   // cellValue will be an object with shape { id: string, type: string, ... }
        //   return { columnName, cellValue };
        // });

        // // since different column "types" (dataTypes) in notion have different data types,
        // // we should verify that each cell value's data "type" matches the type given
        // // in the notionColumnTypes array for that type of column

        // let passesTypeTest: boolean = true;

        // cells.every((cell: DatabaseCell) => {
        //   // for each cell, get the column name of our desired data
        //   const notionColumn = notionColumnsToGet.find((column) => {
        //     column.notionColumnName === cell.columnName
        //   });
        //   if (notionColumn) {
        //     const notionColumnType = notionColumnTypes.find((type) => {
        //       type.columnType === notionColumn;
        //     });
        //     passesTypeTest = cell.cellValue.type === notionColumnTypes[notionColumnType].propertyType;
        //   }
        //   return passesTypeTest;
        // })

        // if (passesTypeTest) {
        //   return cells;
        // }

        // // If a row is found that does not match the rules we checked it will still return in the
        // // the expected shape but with a NOT_FOUND label
        // return {
        //   name: "NOT_FOUND",
        //   ability: "NOT_FOUND",
        //   instructions: "NOT_FOUND",
        // };
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
