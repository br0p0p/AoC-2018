'use strict';

const path = require('path');
const R = require('ramda');
const { includes, map, split, trim } = R;
const { compact, isNumeric, readFileToString } = require('../helpers.js');

const create2dArray = (w, h, p = undefined) => {
    const col = new Array();
    const grid = new Array();

    for (let k = 0; k < h; k++) {
        col.push(p);
    }

    for (let i = 0; i < w; i++) {
        grid.push(Array.from(col));
    }

    return grid;
};

const print2dArray = arr => {
    for (let k = 0; k < arr[0].length; k++) {
        let row = [];

        for (let i = 0; i < arr.length; i++) {
            row.push(arr[i][k]);
        }

        console.log(`\t`, R.join('   ', row));
    }
};

const PLACEHOLDER = '.';
const OVERLAPPING_CLAIM = 'X';

const countIn2dArray = (arr2d, needle = OVERLAPPING_CLAIM) => {
    return arr2d.reduce((acc, col) => {
        return (
            acc +
            col.reduce((acc, row) => {
                if (row === needle) {
                    return acc + 1;
                }
                return acc;
            }, 0)
        );
    }, 0);
};

const part1 = claims => {
    // const gridSize = 8;
    const gridSize = 1000;

    let grid = create2dArray(gridSize, gridSize, PLACEHOLDER);

    // print2dArray(grid);

    const fillCoord = (x, y, id) => {
        // console.log(id, x, y);
        // console.log(typeof x, typeof y);
        const curVal = grid[x][y];

        let result;
        let didOverlap = false;

        if (curVal === PLACEHOLDER) {
            result = id;
        } else if (isNumeric(curVal)) {
            result = OVERLAPPING_CLAIM;
            didOverlap = true;
        }

        if (result) {
            grid[x][y] = result;
        }

        return didOverlap;
    };

    // Pass claim in
    const fillBy = ({ id, x, y, width, height }) => {
        for (let w = 0; w < width; w++) {
            for (let h = 0; h < height; h++) {
                let result = fillCoord(x + w, y + h, id);
            }
        }
    };

    claims.forEach(fillBy);

    console.log('count:', countIn2dArray(grid));

    claims.forEach(({ id, x, y, width, height }) => {
        const expectedCount = width * height;

        const resultingCount = countIn2dArray(grid, id);

        if (expectedCount === resultingCount) {
            console.log(`id ${id} does not overlap!`);
        }
    });
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

        const processLines = R.pipe(
            split('\n'),
            map(trim),
            compact
        );

        const lines = processLines(contents);

        console.log(`${lines.length} ids`);

        const claims = lines.map(line => {
            const processed = R.pipe(
                split(' '),
                map(trim),
                // Remove @ symbol
                arr => {
                    arr.splice(1, 1);
                    return arr;
                }
            )(line);

            // console.log(processed);

            const obj = {
                id: R.pipe(
                    split(''),
                    s => {
                        s.splice(0, 1);
                        return s;
                    },
                    R.join(''),
                    parseFloat
                )(processed[0]),
                x: R.pipe(
                    split(','),
                    R.nth(0),
                    parseFloat
                )(processed[1]),
                y: R.pipe(
                    split(','),
                    R.nth(1),
                    parseFloat
                )(processed[1]),
                width: R.pipe(
                    split('x'),
                    R.nth(0),
                    parseFloat
                )(processed[2]),
                height: R.pipe(
                    split('x'),
                    R.nth(1),
                    parseFloat
                )(processed[2])
            };

            return obj;
        });

        part1(claims);
        // part2(ids);
    } catch (e) {
        throw e;
    }
};

run();
