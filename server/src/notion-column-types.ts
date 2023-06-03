// Define the type of our notion column attributes object
export type NotionDBProperty = {
  columnType: string;
  dataType: string;
  propertyType: string;
  propertyValueType: string;
};

// Define an array of known column attributes from notion
export const notionDBPropertyAttributes: NotionDBProperty[] = [
  {
    columnType: "name",
    dataType: "string",
    propertyType: "title",
    propertyValueType: "plain_text"
  },
  {
    columnType: "text",
    dataType: "string",
    propertyType: "rich_text",
    propertyValueType: "plain_text"
  },
  {
    columnType: "formula",
    dataType: "string",
    propertyType: "formula",
    propertyValueType: "string"
  },
]
