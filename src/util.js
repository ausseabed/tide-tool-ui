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
 * Download a file using only JS
 * @param {*} content content to include in the downloaded file
 * @param {*} filename name of the file that will be downloaded
 * @param {*} contentType mimetype to use for download
 */
const downloadToFile = (content, filename, contentType) => {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });

    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();

    URL.revokeObjectURL(a.href);
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


export {
    readFileAsync,
    tracklinesToCoords,
    simplifyCoords,
    downloadToFile
}
