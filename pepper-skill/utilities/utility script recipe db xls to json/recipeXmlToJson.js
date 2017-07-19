var parseString = require('xml2js').parseString;

var xmlDbFileName = process.argv[2];


var fs = require('fs');

var xmlDb = fs.readFileSync(xmlDbFileName, 'utf8');
// console.log(xmlDb);

var GlossaryDenseObj = {};
parseString(xmlDb, function (err, result) {
    GlossaryDenseObj = result;
});


// console.log(JSON.stringify(GlossaryDenseObj, null, 4));

var itemNameTitles = []; // create an empty array
var simpleJSON = []; // create an empty array

for (var rowNum in GlossaryDenseObj.Workbook.Worksheet[0].Table[0].Row) {
    var rowObj = GlossaryDenseObj.Workbook.Worksheet[0].Table[0].Row[rowNum];

    var writeRow = {};

    var numOfColsinRow = rowObj.Cell.length;
    var colNum = 0;
    var skippedColNum = 0;
    while (colNum < numOfColsinRow) {

        var cellDataObj = rowObj.Cell[colNum];
        var cellText = cellDataObj.Data[0]._;
        // console.log('the cell text extrcted is : ' + cellText + ' in row number ' + rowNum);

        // check if there is a ss:Index defined for this cell, then we'd adjust the column number
        if (cellDataObj.hasOwnProperty('$')) {
            // there are multiple kinds under '$'.   look for the ss:Index specifically
            if (cellDataObj['$'].hasOwnProperty('ss:Index')) {
                var adjustedColNum = cellDataObj['$']['ss:Index'];
                skippedColNum = adjustedColNum - 1; // the values saved by excel in xml start at 1 , not 0
                console.log('found a specific column adjust to : ' + adjustedColNum + ' at orginal row,col ' + rowNum + ', ' + colNum);
            }
        }

        // if its the first row,  push the cell text as the column header
        if (0 == rowNum) {
            itemNameTitles.push(cellText.toLowerCase());
        } else {
            // push the key value pair
            // console.log( 'row number, skippedCol ' + rowNum + ', ' + skippedColNum + ' write using the title : ' + itemNameTitles[skippedColNum] + ' in array ' + JSON.stringify(itemNameTitles, null, 4))

            writeRow[itemNameTitles[skippedColNum]] = cellText;

            if (itemNameTitles[skippedColNum].match(/(ingredients)|(steps)|(directions)/gi)) {
                // if the title of the field is either descrition or ingredients,
                // then split it base on \r and push these into an array of text instead

                var arr = cellText.split("\r");
                var arrOfpromptObjs = [];
                for (itemnum in arr) {

                    // if ingredients, then just push the
                    if (itemNameTitles[skippedColNum].match(/ingredients/gi)) {
                        arrOfpromptObjs.push(arr[itemnum]);
                    } else {
                        var promptObj = {};
                        promptObj.prompt = arr[itemnum];

                        // detect time delays in the text
                        var rePattern = new RegExp(/(([A-Za-z]+\s(a(n)?|(of))?)|((([0-9]+(.[0-9]+)?)\s*(-|[Tt]o)\s*)*([0-9]+(.[0-9]+)?)))\s*(([Mm]inutes*)|([Hh]ours*))/);
                        var arrMatches = arr[itemnum].match(rePattern);
                        if (arrMatches !== null) {
                            promptObj.duration = arrMatches[0].replace('-', ' to ');
                        }

                        arrOfpromptObjs.push(promptObj);

                    }
                }
                writeRow[itemNameTitles[skippedColNum]] = arrOfpromptObjs;
            }

            if (itemNameTitles[skippedColNum].match(/tags/gi)) {
                // if the title of the field is either descrition or ingredients,
                var arr = cellText.split(',');
                for (arrIndx in arr) {
                    arr[arrIndx] = arr[arrIndx].trim()
                }
                writeRow[itemNameTitles[skippedColNum]] = arr;
            }


        }

        colNum++;
        skippedColNum++;
    }

    if (rowNum > 0) simpleJSON.push(writeRow);

}

// console.log('the titles of the database are : ' + JSON.stringify(itemNameTitles, null, 4))


var dict = {recipe: simpleJSON};

var fileNameComponents = xmlDbFileName.split('.');

fs.writeFile(fileNameComponents[0] + '.json', JSON.stringify(dict, null, 4), function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log("JSON saved to cleanGlossary.json");
    }
});
