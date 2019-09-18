var ui = SpreadsheetApp.getUi();
var breakTag = '<br>';
var sheet = SpreadsheetApp.getActiveSheet();


//Add menu items on Google Sheets
function onOpen() {
  ui.createMenu('Book Inventory')
      .addItem('Add Books', 'menuItem1')
      .addItem('Search', 'menuItem2')
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

function processForm(formObject) {
  var isbn = formObject.isbn;
  
  var response = JSON.parse(getBookInfoWithIsbn(isbn));
  addToHashMap(response);
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
  addDataToSheet(response);
  
  return output.getContent();
}

function processSearch(formObject) {
  return null; 
}


function addDataToSheet(response){
  //This is just to show it's actually possible to insert data into Google Sheets.
  var book = response.items[0].volumeInfo;
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

// some fields are arrays, lets parse them out
// so they are easy to read in a row
function parseMyList(list) {
}

//prase list items to comma separated string
function parseListToCommaSeparatedString(list) {
  var comma_separated_string = "";
  for (var i = 0; i < list.length; i++){
    comma_separated_string + list[i];
    if (i != list -1){
      comma_separated_list + ', ';
    }
  }
  return comma_separated_list;
}

function addToHashMap(response){
  var book = response.items[0].volumeInfo;
  var map = {};
  map["Title"] = book.title ? book.title: "";
  map["Subtitle"] =  book.subtitle ? book.subtitle : "";
  var authorList = "";
  for (var i = 0; i < book.authors.length; i++){
    authorList + book.authors[i];
    if (i != book.authors.length -1){
      authorList + ', ';
    }
  }
    map["Authors"] = authorList;
  map
  return map;
}