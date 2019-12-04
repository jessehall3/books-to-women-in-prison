var isbn = "\"9780911207026\""
var title = "Feelings Buried Alive Never Die"
var authors = "[\"Prepress Staff\"]"
var publisher = "Olympus Publishing"
var description = "Karol Truman provides a comprehensive and..."
var categories =  "[\"Body, Mind & Spirit\"]"

const bookData = {}

bookData.isbn = JSON.parse(isbn)
bookData.title = title
bookData.authors = JSON.parse(authors)
bookData.publisher = publisher
bookData.description = description
bookData.categories = JSON.parse(categories)

console.log(JSON.stringify(bookData, null, 2));

console.log(bookData.categories.length);

// go through all rows
// build a book data object and push

function sendAllData(searchTerm){
  // var lastRowNumber = booksSpreadSheet.getLastRow();
  // var getRange = ss.getDataRange()
  // var getRow  = getRange.getRow()

  var TITLE_COLUMN_INDEX = 2;
  var col = TITLE_COLUMN_INDEX;
  var numRows = booksSpreadSheet.getLastRow();

  var re = new RegExp(searchTerm.trim(), 'i');

  function is_match(testValue){
    result = testValue.trim().search(re);
    return (result != -1);
  }

  for (var row = 1; col <= numRows; i++){
    var cell = booksSpreadSheet.getRange(row, col);
    var cellContent = cell.getValue();

    if (is_match(cellContent)){
      booksSpreadSheet.hideRow(row);
    }
  }
}
