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

            if (skippedColNum == 0) {
                // make the first column ("item") as a text string
                writeRow[itemNameTitles[skippedColNum]] = cellText;
            } else {
                // make the second column ("substitute") as an array of strings
                cellText = cellText.replace(/;/g, ','); // there are cases where substitutes are seperated by ; instead of ,

                var regExp = /\(([^)]+)\)/g;
                var matches = regExp.exec(cellText);
                if (Array.isArray(matches)) {
                    cellText = cellText.replace(/\(([^)]+)\)/g, '%%%'); // replace the text within braces with the %%% code
                    matches[0] = matches[0].replace(/,\s*or\s+/g, 'OR '); // replace 'or' with 'OR' within braces to skip splitting
                    matches[0] = matches[0].replace(/,/g, ';');  // replace , with ; within braces to skip splitting
                    cellText = cellText.replace(/%%%/g, matches[0]); // replace the coded %%% back with the text of braces
                }

                // get rid of an 'or' at the very end of some of the comma seperated items
                cellText = cellText.replace(/,\s*or\s+/g, ', ');

                // split based on comma to create a list of substitutes
                var arr = cellText.split(',');
                for (arrIndx in arr) {
                    arr[arrIndx] = arr[arrIndx].trim()
                    arr[arrIndx] = arr[arrIndx].replace(/;/g, ',');
                }

                // write the array of substitutes
                writeRow[itemNameTitles[skippedColNum]] = arr;
            }

        }

        colNum++;
        skippedColNum++;
    }

    if (rowNum > 0) simpleJSON.push(writeRow);

}

// console.log('the titles of the database are : ' + JSON.stringify(itemNameTitles, null, 4))


var dict = {list: simpleJSON};

var fileNameComponents = xmlDbFileName.split('.');

fs.writeFile(fileNameComponents[0] + '.json', JSON.stringify(dict, null, 4), function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log("JSON saved to " + fileNameComponents[0] + '.json');
    }
});



var textlist = '';
for (itemnum in simpleJSON) {
    var cellText = simpleJSON[itemnum].item;

    cellText = cellText.replace(/;/g, ','); // there are cases where substitutes are seperated by ; instead of ,
    cellText = cellText.replace(/\(([^)]+)\)/g, ''); // replace the text within braces with the %%% code
    cellText = cellText.replace(/%%%/g, ''); // replace the text within braces with the %%% code


    var arr = cellText.split(',');
    if (arr.length > 1) {
        console.log('\n' + JSON.stringify(arr, null, 4))
        cellText = arr[1].trim() + ' ' + arr[0].trim();
    }

    textlist += '\n' + cellText;
}

fs.writeFile(fileNameComponents[0] + '_itemlist.txt', textlist, function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log("JSON saved to " + fileNameComponents[0] + '_itemlist.txt');
    }
});
