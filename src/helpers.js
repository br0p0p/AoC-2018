const fs = require('fs');
const util = require('util');

const readFileToString = async filePath => {
    const _f = util.promisify(fs.readFile);
    return await _f(filePath, { encoding: 'UTF-8' });
};

// Remove falsy values from an array.
const compact = (arr = []) => {
    return arr.reduce((acc, val) => {
        if (val !== undefined && val != null && val !== '') {
            acc.push(val);
        }
        return acc;
    }, []);
};

module.exports = {
    compact,
    readFileToString
};
