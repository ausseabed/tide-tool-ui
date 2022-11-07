import simplify from 'simplify-js'

/*
Util functions and classes for the Tide Tool UI
*/

/**
 * async wrapper for reading file
 * @param {*} info fileinfo object
 * @returns file contents as a string
 */
function readFileAsync(info) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.onload = (e) => {
        resolve(e.target.result);
    };

    reader.onerror = reject;
    reader.readAsText(info.file.originFileObj);
  })
}

/**
 * Parses the string by first breaking it down into a list of
 * strings (separated by newline), then extracting the x and y
 * coordinates from each line.
 * @param {*} tracklinesData single string containing the contents
 * of a tracklines file
 * @returns list of coord objects
 */
function tracklinesToCoords(tracklinesData) {
    let lines = tracklinesData.split("\n")
    // remove the header line
    lines.shift()
    let coords = lines
    .filter(line => {
        return line.length != 0
    })
    .map(line => {
        let lineBits = line.split(',')
        return {
            x: parseFloat(lineBits[4]),
            y: parseFloat(lineBits[3])
        }
    });

    return coords
}


function simplifyCoords(coords) {
    let simplified = simplify(coords, 0.01, false);
    return simplified
}


export { readFileAsync, tracklinesToCoords, simplifyCoords }
