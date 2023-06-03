import { config } from "./notion-config";
import {
  NotionDBProperty,
  notionDBPropertyAttributes,
} from "./notion-column-types";
import http from "http";
import { Client } from "@notionhq/client";

function getValueFromNotionDBRow(object: any[], propertyString: string) {
  const properties: string[] = propertyString.split(".");
  let value: any = object;

  // for (let i = 0; i < properties.length; i++) {
  // TODO get the rest of the way down the accessor chain
  // accounting for if the value is null at an earlier property in the chain
  for (let i = 0; i < 2; i++) {
    const property = properties[i];
    value = value[property];

    if (value === undefined) {
      // Handle invalid property path
      return undefined;
    } else if (Array.isArray(value)) {
      value = value[0];
    }
  }

  return value;
}

/**
 * @param columnType
 * @returns notionDBProperty
 */
function getNotionDBPropertyAttributesByColumnType(columnType: string) {
  return notionDBPropertyAttributes.find(
    (notionDBProperty) => notionDBProperty.columnType === columnType
  );
}

interface NotionColumn {
  notionColumnName: string;
  notionColumnType: string;
}

const notionColumnsToGet: NotionColumn[] = [
  { notionColumnName: "Name", notionColumnType: "name" },
  { notionColumnName: "Ability text", notionColumnType: "formula" },
  { notionColumnName: "Instructions", notionColumnType: "text" },
  { notionColumnName: "Image", notionColumnType: "files" },
];

// get our database configuration from notion-config.js
const { databases } = config;
const notionDBId = databases.crew;
const notionSecret = config.notionSecretKey;

// Will provide an error to users who forget to create the .env file
// with their Notion data in it
if (!notionDBId || !notionSecret) {
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
        database_id: notionDBId,
        sorts: [
          {
            property: "Name",
            direction: "ascending",
          },
        ],
      });

      // We map over the complex shape of the results and return an array of
      // values from each column of the desired columns (notionColumnsToGet)
      const list: string[][] = query.results.map((row: any) => {
        // get the plain text data from the matching column in the current row
        const allColumnsPropertyValues: string[] = notionColumnsToGet.map(
          (column: NotionColumn) => {
            // get the notionColumnType of the column, then its property path
            const notionProperty: NotionDBProperty | undefined =
              getNotionDBPropertyAttributesByColumnType(
                column.notionColumnType
              );
            if (notionProperty) {
              const notionPropertyType: string = notionProperty.propertyType;
              const notionPropertyValueType: string =
                notionProperty.propertyValueType;
              const columnName: string = column.notionColumnName;
              const propertyValueParent =
                row.properties[columnName][notionPropertyType];

              let propertyValueObject: { [key: string]: string } = {};

              if (Array.isArray(propertyValueParent)) {
                propertyValueObject = propertyValueParent[0];
              } else {
                propertyValueObject = propertyValueParent;
              }

              if (propertyValueObject) {
                return propertyValueObject[notionPropertyValueType];
              }

              return `value for "${column.notionColumnName}" not found on this row`;
            }

            // if the notion database property doesn't exist in notionDBPropertyAttributes, return an error message
            return `properties definition for Notion property type '${column.notionColumnType}' not found in notion db properties array (notionDBPropertyAttributes)`;
          }
        );

        return allColumnsPropertyValues;
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
