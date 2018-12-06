const path = require('path');
const R = require('ramda');
const { compose, includes, join, map, pipe, prop, split, trim } = R;
const { compact, readFileToString } = require('../helpers.js');

const removeBrackets = s => s.replace('[', '').replace(']', '');
const parseId = s => parseFloat(s.replace('#', ''));

const part1 = () => {};

const parseEventsFromLines = lines => {
    const entries = lines.map(line => {
        const parts = pipe(
            split(' '),
            map(removeBrackets)
        )(line);

        return {
            date: parts[0],
            time: parts[1],
            event: pipe(
                R.drop(2),
                join(' ')
            )(parts)
        };
    });

    const sortedEntries = R.sortWith([
        R.ascend(prop('date')),
        R.ascend(prop('time'))
    ])(entries);

    const getIdFromEvent = (s, acc = '?') => {
        return pipe(
            split(' '),
            parts =>
                parts.reduce((acc, val) => {
                    const result = parseId(val);

                    if (!isNaN(result)) {
                        return result;
                    }

                    return acc;
                }, acc)
        )(s);
    };

    let normalizedEvents = [];
    let currentId;

    for (let entry of sortedEntries) {
        currentId = getIdFromEvent(entry.event, currentId);

        normalizedEvents.push({
            ...entry,
            id: currentId,
            event: pipe(
                split(' '),
                R.takeLast(2),
                join(' ')
            )(entry.event)
        });
    }

    return normalizedEvents;
};

const replaceFrom = (start, finish, val = '#', arr) => {
    for (let i = start; i < finish; i++) {
        arr[i] = val;
    }

    return arr;
};

const printDailyActivity = dailyActivity => {
    console.log('DATE\tID\tMINUTE');
    console.log(
        '\t\t000000000011111111112222222222333333333344444444445555555555'
    );
    console.log(
        '\t\t012345678901234567890123456789012345678901234567890123456789'
    );
    dailyActivity.forEach(day => {
        const { date, id, sleepSchedule } = day;
        console.log(
            `${date.replace('1518-', '')}\t${id}\t${join('', sleepSchedule)}`
        );
    });
};

const pipeLog = v => {
    console.log(v);
    return v;
};

const getMaxValFromArray = a => Math.max(...a);

const run = async () => {
    try {
        const filePath = path.resolve(__dirname, './input.txt');
        console.info(`Reading ${filePath} ...`);
        const contents = await readFileToString(filePath);

        if (!contents) {
            console.error('no file contents...');
            return;
        }

        const getLines = R.pipe(
            split('\n'),
            map(trim),
            compact
        );

        const lines = getLines(contents);

        console.log(`${lines.length} ids`);

        const eventObjs = parseEventsFromLines(lines);

        // console.log(eventObjs);

        const dailyActivity = eventObjs.reduce((acc, entry) => {
            if (entry.event === 'begins shift') {
                let result = {};

                result.date = entry.date;
                result.id = entry.id;

                result.sleepSchedule = R.repeat('.', 60);

                result.event = entry.event;
                acc.push(result);
            } else {
                // Get last result if still on same shift
                const result = acc[acc.length - 1];
                const minutes = parseFloat(
                    pipe(
                        split(':'),
                        R.last
                    )(entry.time)
                );

                if (entry.event === 'falls asleep') {
                    result.sleepSchedule = replaceFrom(
                        minutes,
                        result.sleepSchedule.length,
                        '#',
                        result.sleepSchedule
                    );
                } else if (entry.event === 'wakes up') {
                    result.sleepSchedule = replaceFrom(
                        minutes,
                        result.sleepSchedule.length,
                        '.',
                        result.sleepSchedule
                    );
                } else {
                    console.log('????????');
                }
            }

            const last = acc[acc.length - 1];
            // console.log('last result:', last);
            // console.log(last.sleepSchedule.length);

            return acc;
        }, []);

        printDailyActivity(dailyActivity);

        const sleepStats = dailyActivity.reduce((acc, day) => {
            let staffEntry = {};
            const staffEntryIdx = R.findIndex(R.propEq('id', day.id))(acc);

            if (staffEntryIdx === -1) {
                staffEntry.id = day.id;
                staffEntry.totalMinsAsleep = 0;
                staffEntry.minutesAsleepCount = Array.from(R.repeat(0, 60));
            } else {
                staffEntry = R.head(acc.splice(staffEntryIdx, 1));
            }

            const sleepMins = R.countBy(R.equals('#'))(day.sleepSchedule).true;

            staffEntry.totalMinsAsleep += !isNaN(sleepMins) ? sleepMins : 0;

            staffEntry.minutesAsleepCount = staffEntry.minutesAsleepCount.map(
                (count, i) => {
                    if (day.sleepSchedule[i] === '#') {
                        return count + 1;
                    }
                    return count;
                }
            );

            acc.push(staffEntry);
            return acc;
        }, []);

        const sleepiest = pipe(
            R.sortBy(R.prop('totalMinsAsleep')),
            R.last
        )(sleepStats);

        // console.log('sleepiest staff member:', sleepiest);
        // console.log('sleepiest staff member:', sleepiest.id);

        const sleepiestTime = sleepiest.minutesAsleepCount.reduce(
            (acc, val, i) => {
                if (val > sleepiest.minutesAsleepCount[acc]) {
                    return i;
                }

                return acc;
            },
            0
        );

        console.log('sleeps hardest at:', sleepiestTime);

        console.log('part1 answer:', sleepiestTime * sleepiest.id);

        const mostFrequentlyAsleepAtMin = sleepStats.reduce(
            (acc, staffEntry) => {
                const max = getMaxValFromArray(staffEntry.minutesAsleepCount);

                const staffStats = {
                    id: staffEntry.id,
                    minute: staffEntry.minutesAsleepCount.indexOf(max),
                    max: max
                };

                console.log(staffStats);

                if (max > acc.max) {
                    acc = staffStats;
                }

                return acc;
            },
            {
                id: -1,
                minute: -1,
                max: -1
            }
        );

        console.log(
            'part2 answer:',
            mostFrequentlyAsleepAtMin,
            mostFrequentlyAsleepAtMin.id * mostFrequentlyAsleepAtMin.minute
        );

        // part1(claims);
        // part2(ids);
    } catch (e) {
        throw e;
    }
};

run();
