var ui = SpreadsheetApp.getUi();
var breakTag = '<br>';
var sheet = SpreadsheetApp.getActiveSheet();
var ENDPOINT_TO_POST_DATA_TO_ALGOLIA = "https://us-central1-books-259218.cloudfunctions.net/function-1";

//Add menu items on Google Sheets
function onOpen() {
  ui.createMenu('Book Inventory')
      .addItem('Add Books', 'menuItem1')
      .addItem('Search', 'menuItem2')
      .addItem('Sidebar Search', 'menuItem3')
      .addToUi();
}

//Action when the Book Inveontory -> Book Inventory menu item is selected.
function menuItem1() {
  var html = HtmlService.createHtmlOutputFromFile('AddBooks')
  .setWidth(600)
  .setHeight(800);

  SpreadsheetApp.getUi()
     .showModalDialog(html, 'Add Books');
}

//Action when the Book Inveontory -> Book Inventory menu item is selected.
function menuItem2() {
  var html = HtmlService.createHtmlOutputFromFile('Search')
  .setWidth(600)
  .setHeight(800);
  SpreadsheetApp.getUi()
     .showModalDialog(html, 'Search');
}

function menuItem3() {
  var html = HtmlService.createHtmlOutputFromFile('SidebarSearch')
    .setTitle('Search Books')
    .setWidth(300);
  SpreadsheetApp.getUi()
    .showSidebar(html);
}

function buildRequest(isbnNumber){
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var filterSettings = {};

  filterSettings.range = {
    sheetId: ss.getActiveSheet().getSheetId()
  };

  filterSettings.criteria = {};
  var columnIndex = 0;



  var conditionValue = {
    "userEnteredValue": isbnNumber
  }

  var booleanCondition = {
    "type": "TEXT_CONTAINS",
    "values": [
      conditionValue
    ]
  }

  var filterCriteria = {
    "condition": booleanCondition
  };

  filterSettings['criteria'][columnIndex] = filterCriteria;

  var request = {
    "setBasicFilter": {
      "filter": filterSettings
    }
  };

  return request;
}

function setFilter() {
  var HARRY_POTTER_ISBN = "0747532699"
  var HIGH_RISERS_ISBN = "0062235060";

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var harry_potter_request = buildRequest(HARRY_POTTER_ISBN)
  var high_risers_request = buildRequest(HIGH_RISERS_ISBN)

  var isbnNumbers = [HARRY_POTTER_ISBN, HIGH_RISERS_ISBN]

  var regex_pattern = isbnNumbers.join("|")

  var UserEnteredValue = "=AND(NOT(ISBLANK(A2)),(1*REGEXEXTRACT(A2,\"\\d+\"))>(1*REGEXEXTRACT(B2,\"\\d+\")))"
  var foo = REGEXMATCH(A2, "[0-9]+")
  var foo =OR(REGEXMATCH(B2, "Har"), REGEXMATCH(D2, "Har"))
  // =REGEXMATCH(B2, "(?i)oo|har")
  // =REGEXMATCH(A2, "0747532699|0062235060")
  var rowCount = mySheet.getMaxRows()
  var foo = 'REGEXMATCH(A1:A' + rowCount +  ', ' +  regex_pattern + ')'


  Sheets.Spreadsheets.batchUpdate({'requests': [harry_potter_request, high_risers_request]}, ss.getId());
}

function clearFilter() {

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var filter = {
    sheetId: ss.getActiveSheet().getSheetId()
  };

  var request = {
    "clearBasicFilter": filter
  };

  Sheets.Spreadsheets.batchUpdate({'requests': [request]}, ss.getId());
}

function processForm(formObject) {
  var isbn = formObject.isbn;
  var response = JSON.parse(getBookInfoWithIsbn(isbn));
  if (response.totalItems == 0){
    ui.alert("Book is not found.");
  }
  var book = response.items[0].volumeInfo;
  var output = HtmlService.createHtmlOutput('<b>Search Result:</b>');
  output.append(breakTag);
  output.append(breakTag);
  output.append('<b>Book Title:</b> ' + book.title);
  output.append(breakTag);
  output.append('<b>Subtitle:</b> ' + book.subtitle);
  output.append(breakTag);
  output.append('<b>Authors</b> ')
  for (var i = 0; i < book.authors.length; i++){
    output.append(book.authors[i]);
    if (i != book.authors.length -1){
      output.append(', ');
    }
  }
  output.append(breakTag);
  output.append('<b>Book Cover:</b>')
  output.append(breakTag);
  output.append('<img src="' + book.imageLinks.thumbnail + '"/>');
  output.append(breakTag);
  output.append('<b>Publish Date:</b> ' + book.publishedDate);
  output.append(breakTag);
  output.append('<b>Categories: </b> ');

  for (var i = 0 ; i < book.categories.length; i++){
    output.append(book.categories[i]);
    if (i != book.categories.length -1){
      output.append(', ');
    }
  }
  output.append(breakTag);
  output.append(breakTag);
  output.append('<b>Description: </b>' + book.description);
  output.append(breakTag);
  Logger.log(response.items[0].searchInfo);
  output.append('<b>Text Snippet: </b>' + response.items[0].searchInfo.textSnippet);

  addDataToSheet(book);

  addDataToSearchDatabase(book);

  return output.getContent();
}

//Wrote the process search function. me
function processSearch(formObject) {
  var result = "";
  console.info("SEARCH TEST 11 ");
  console.info(formObject);
  console.info(formObject.title);

  //These constants correspond to the columns in the spreadsheet representing these piece of information
  const ISBN_COL = 1;
  const TITLE_COL = 2;
  const AUTHOR_COL = 3;
  const DESCRIPTION_COL = 5;

  var ISBNColValues = sheet.getRange(2, ISBN_COL, sheet.getLastRow()).getValues(); //1st is header row
  var titleColValues = sheet.getRange(2, TITLE_COL, sheet.getLastRow()).getValues(); //1st is header row
  var authorColValues = sheet.getRange(2, AUTHOR_COL, sheet.getLastRow()).getValues(); //1st is header row
  var DescriptionColValues = sheet.getRange(2, DESCRIPTION_COL, sheet.getLastRow()).getValues(); //1st is header row

  var ISBNSearchResult = ISBNColValues.findIndex(formObject.isbn) + 2; //MUST ADD BACK 2 TO CORRECT FOR TITLE ROW
  var titleSearchResult = titleColValues.findIndex(formObject.title) + 2; //MUST ADD BACK 2 TO CORRECT FOR TITLE ROW
  var authorSearchResult = authorColValues.findIndex(formObject.author) + 2; //MUST ADD BACK 2 TO CORRECT FOR TITLE ROW
  var descriptionSearchResult = DescriptionColValues.findIndex(formObject.description) + 2; //MUST ADD BACK 2 TO CORRECT FOR TITLE ROW


  //titleSearchResult will equal 1 if no results came back
  if (ISBNSearchResult != 1){
    result += "ISBN : Col-" + ISBN_COL + " Row-" + ISBNSearchResult + "<br>";
  }
  if (titleSearchResult != 1){
    result += "TITLE : Col-" + TITLE_COL + " Row-" + titleSearchResult + "<br>";
  }
  if (authorSearchResult != 1){
    result += "AUTHOR : Col-" + AUTHOR_COL + " Row-" + authorSearchResult + "<br>";
  }
  if (descriptionSearchResult != 1){
    result += "DESCRIPTION : Col-" + DESCRIPTION_COL + " Row-" + descriptionSearchResult + "<br>";
  }
  if (result == ""){
    result = "No results from any fields in the search";
  }
  console.info(result);
  return result;

}

// Compute the edit distance between the two given strings
function getEditDistance(a, b) {
  console.info("IN SED")
  console.info("a: " + a)
  console.info("b: " + b)
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  var matrix = [];
  // increment along the first column of each row
  var i;
  for (i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  // increment each column in the first row
  var j;
  for (j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  // Fill in the rest of the matrix
  for (i = 1; i <= b.length; i++) {
    for (j = 1; j <= a.length; j++) {
      if (b.charAt(i-1) == a.charAt(j-1)) {
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                Math.min(matrix[i][j-1] + 1, // insertion
                                         matrix[i-1][j] + 1)); // deletion
      }
    }
  }

  return matrix[b.length][a.length];
};

//this is used in the processSearch function.
//I can't say here or there if this use of prototypes is good practice
//but im not going to change it at this time.
//https://stackoverflow.com/questions/18482143/search-spreadsheet-by-column-return-rows
Array.prototype.findIndex = function(search){

  if(search == "") return false;

  console.info("SED TEST : " + getEditDistance("string", "string"));
  console.info("SEARCH : " + search);
  for (var i=0; i<this.length; i++)
    if (this[i] == search) return i;

  return -1;
}

function addDataToSearchDatabase(book){
  var bookData = {
    isbn: book.industryIdentifiers[0].identifier,
    title: book.title,
    authors: book.authors,
    publisher: book.publisher,
    description: book.description,
    categories: book.categories
  }

  var options = {
    'method' : 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify(bookData),
    'muteHttpExceptions': true
  };

  var uri = ENDPOINT_TO_POST_DATA_TO_ALGOLIA;

  UrlFetchApp.fetch(uri, options);
}

function addDataToSheet(book){
  //This is just to show it's actually possible to insert data into Google Sheets.
  var ISBN13 = JSON.stringify(book.industryIdentifiers[0].identifier);
  var title = book.title;
  var authors = JSON.stringify(book.authors);
  var publisher = book.publisher;
  var description = book.description;
  var categories = JSON.stringify(book.categories);

  sheet.appendRow([ISBN13, title, authors, publisher, description, categories]);
}

function getBookInfoWithIsbn(isbn){
  var uri = 'https://www.googleapis.com/books/v1/volumes?q=isbn:' + isbn;
  var response = UrlFetchApp.fetch(uri, {'muteHttpExceptions': true});
  return response;
}
