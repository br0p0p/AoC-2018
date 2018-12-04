const path = require('path');
const R = require('ramda');
const { includes, split, trim } = R;
const { compact, readFileToString } = require('../helpers.js');

const addToFreq = (arr, val) => {
    if (arr[val] >= 0) {
        arr[val] += 1;
    } else {
        arr[val] = 1;
    }
};

const noDupes = arr => !includes(2, arr);

const doOp = (op, acc) => {
    const operator = op[0];
    const val = parseFloat(op.substring(1, op.length));

    if (operator === '-') {
        acc -= val;
    } else if (operator === '+') {
        acc += val;
    } else {
        console.error('unknown operator: ', operator);
    }

    return acc;
};

const run = async () => {
    try {
        const filePath = path.resolve(__dirname, './input.txt');
        console.info(`Reading ${filePath} ...`);
        const contents = await readFileToString(filePath);

        if (!contents) {
            console.error('no file contents...');
            return;
        }

        const processOps = R.pipe(
            split('\n'),
            arr => arr.map(trim),
            compact
        );

        // Split by line
        const ops = processOps(contents);

        console.log(`${ops.length} ops`);

        let frequencies = [];
        let acc = 0;

        // Op index
        let i = -1;

        do {
            i = (i + 1) % ops.length;

            let op = ops[i];
            acc = doOp(op, acc);

            if (i === ops.length - 1) {
                console.log(acc);
            }

            addToFreq(frequencies, acc);
        } while (noDupes(frequencies));

        console.log('dupe:', acc);
    } catch (e) {
        throw e;
    }
};

run();
