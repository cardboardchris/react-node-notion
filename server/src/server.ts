import { config } from './notion-config';
import { NotionDBProperty, notionDBPropertyAttributes } from './notion-column-types';
import http from 'http';
import { Client } from '@notionhq/client';

function getValueFromNotionDBRow(object: any[], propertyString: string) {
  const properties: string[] = propertyString.split('.');
  let value: any = object;

  // for (let i = 0; i < properties.length; i++) {
    // TODO get the rest of the way down the accessor chain
    // accounting for if the value is null at an earlier property in the chain
  for (let i = 0; i < 3; i++) {
    const property = properties[i];
    value = value[property];

    if (value === undefined) {
      // Handle invalid property path
      return undefined;
    }
    else if (Array.isArray(value)) {
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
  return notionDBPropertyAttributes.find(notionDBProperty => notionDBProperty.columnType === columnType);
};

interface NotionColumn {
  notionColumnName: string,
  notionColumnType: string,
}

const notionColumnsToGet: NotionColumn[] = [
  { notionColumnName: 'Name', notionColumnType: 'name' },
  { notionColumnName: 'Ability text', notionColumnType: 'formula' },
  { notionColumnName: 'Instructions', notionColumnType: 'text' }
];

// get our database configuration from notion-config.js
const { databases } = config;
const notionDBId = databases.crew;
const notionSecret = config.notionSecretKey;

// Will provide an error to users who forget to create the .env file
// with their Notion data in it
if (!notionDBId || !notionSecret) {
  throw Error(
    'No keys defined. Define notionSecretKey and database IDs in notion-config.ts'
  );
}

// Initializing the Notion client with your secret
const notion = new Client({
  auth: notionSecret,
});

const host = 'localhost';
const port = 8000;

// Require an async function here to support await with the DB query
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  switch (req.url) {
    case '/':
      // Query the database and wait for the result
      const query = await notion.databases.query({
        database_id: notionDBId,
      });

      const results: any[] = query.results;

      const getNotionDBPropertyAttributesByColumnType = (columnType: string) => {
        return notionDBPropertyAttributes.find(notionDBProperty => notionDBProperty.columnType === columnType);
      };

      // We map over the complex shape of the results and return an array of
      // values from each column of the desired columns (notionColumnsToGet)
      const list: any[][] = query.results.map((row: any) => {

        // get the plain text data from the matching column in the current row
        const allColumnsPropertyValues: string[] = notionColumnsToGet.map((column: NotionColumn) => {
          // get the notionColumnType of the column, then its property path
          const notionProperty: NotionDBProperty|undefined = getNotionDBPropertyAttributesByColumnType(column.notionColumnType);
          // const notionPropertyValuePath: string|undefined = getNotionDBPropertyAttributesByColumnType(column.notionColumnType)?.propertyValuePath;
          if (notionProperty) {
            const notionPropertyValuePath: string = notionProperty.propertyValuePath;
            const columnName: string = column.notionColumnName;
            const accessorString = `properties.${columnName}.${notionPropertyValuePath}`;

            // return accessorString;
            return getValueFromNotionDBRow(row, accessorString);
            // return row.properties[column.notionColumnName];
            // return row.properties[column.notionColumnName][notionPropertyValuePath];
          }

          // if the notion database property doesn't exist in notionDBPropertyAttributes, return an error message
          return 'could not get property value path';
        });

        // const notionValuePath: string = columnAttributes.propertyPath;

        return allColumnsPropertyValues;
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

        // // since different column 'types' (dataTypes) in notion have different data types,
        // // we should verify that each cell value's data 'type' matches the type given
        // // in the notionColumnAttributes array for that type of column

        // let passesTypeTest: boolean = true;

        // cells.every((cell: DatabaseCell) => {
        //   // for each cell, get the column name of our desired data
        //   const notionColumn = notionColumnsToGet.find((column) => {
        //     column.notionColumnName === cell.columnName
        //   });
        //   if (notionColumn) {
        //     const notionColumnType = notionColumnAttributes.find((type) => {
        //       type.columnType === notionColumn;
        //     });
        //     passesTypeTest = cell.cellValue.type === notionColumnAttributes[notionColumnType].propertyType;
        //   }
        //   return passesTypeTest;
        // })

        // if (passesTypeTest) {
        //   return cells;
        // }

        // // If a row is found that does not match the rules we checked it will still return in the
        // // the expected shape but with a NOT_FOUND label
        // return {
        //   name: 'NOT_FOUND',
        //   ability: 'NOT_FOUND',
        //   instructions: 'NOT_FOUND',
        // };
      });

      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(list));
      break;

    default:
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Resource not found' }));
  }
});

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
