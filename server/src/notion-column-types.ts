// Define the type of our notion column attributes object
export type NotionDBProperty = {
  columnType: string;
  dataType: string;
  propertyType: string;
  propertyValuePath: string;
};

// Define an array of known column attributes from notion
export const notionDBPropertyAttributes: NotionDBProperty[] = [
  {
    columnType: "name",
    dataType: "string",
    propertyType: "title",
    propertyValuePath: "title.plain_text"
    // propertyValuePath: "title[0].plain_text"
  },
  {
    columnType: "text",
    dataType: "string",
    propertyType: "rich_text",
    propertyValuePath: "rich_text.plain_text"
    // propertyValuePath: "rich_text[0].plain_text"
  },
  {
    columnType: "formula",
    dataType: "string",
    propertyType: "formula",
    propertyValuePath: "formula.string"
  },
]
