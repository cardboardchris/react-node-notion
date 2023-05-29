export const notionColumnTypes: any[] = [
  {
    columnType: "name",
    dataType: "string",
    propertyType: "title",
    propertyPath: "title[0].plain_text"
  },
  {
    columnType: "text",
    dataType: "string",
    propertyType: "rich_text",
    propertyPath: "rich_text[0].plain_text"
  },
  {
    columnType: "formula",
    dataType: "string",
    propertyType: "formula",
    propertyPath: "formula.string"
  },
]
