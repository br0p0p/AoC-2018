const path = require('path');
const R = require('ramda');
const { includes, map, split, trim } = R;
const { compact, readFileToString } = require('../helpers.js');

const containsFreq2 = includes(2);
const containsFreq3 = includes(3);

const part1 = async ids => {
    const result = ids.reduce(
        (acc, id) => {
            const getCharCounts = R.pipe(
                split(''),
                R.countBy(R.identity)
            );
            // const chars = split('', id);
            // const counts = R.countBy(R.identity)(chars);

            const counts = getCharCounts(id);

            let newAcc = acc;

            if (containsFreq2(R.values(counts))) {
                newAcc.freq2 += 1;
            }

            if (containsFreq3(R.values(counts))) {
                newAcc.freq3 += 1;
            }

            return newAcc;
        },
        { freq2: 0, freq3: 0 }
    );

    console.log('freq result:', result);

    console.log('checksum:', result.freq2 * result.freq3);
};

const differBy = (a, b, x) => {
    if (a.length === b.length) {
        let differences = 0;

        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                differences += 1;
            }

            if (differences > x) {
                return false;
            }
        }

        if (differences === x) {
            return true;
        }
    } else {
        console.log('weird...');
    }
};

const differByOne = R.partialRight(differBy, [1]);

const dropDifferences = (a, b) => {
    let acc = [];
    for (let i = 0; i < a.length; i++) {
        if (a[i] === b[i]) {
            acc.push(a[i]);
        }
    }

    return acc;
};

const part2 = async ids => {
    const findMatches = () => {
        for (let i = 0; i < ids.length; i++) {
            for (let k = i + 1; k < ids.length; k++) {
                // console.log(`comparing ${ids[i]} with ${ids[k]}`);

                if (differByOne(ids[i], ids[k])) {
                    return [ids[i], ids[k]];
                }
            }
        }

        return null;
    };

    const result = findMatches();

    if (result) {
        console.log(
            'differ by one:',
            '\n',
            result[0],
            '\n',
            result[1],
            '\n',
            '-> ',
            R.join('', dropDifferences(result[0], result[1]))
        );
    } else {
        console.log('No match found...');
    }
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

        const processIds = R.pipe(
            split('\n'),
            map(trim),
            compact
        );

        const ids = processIds(contents);

        // console.log(ids);
        console.log(`${ids.length} ids`);

        part1(ids);
        part2(ids);
    } catch (e) {
        throw e;
    }
};

run();
