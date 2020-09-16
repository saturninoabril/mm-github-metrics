const moment = require('moment');
const {readJsonFromFile, writeJsonToFile} = require('./utils/file');

const argv = require('yargs').argv;
const {file} = argv;
const data = readJsonFromFile(file);
// console.log('data', data);

const groups = data.reduce((acc, d) => {
    const date = moment(d.committed_at);
    // create a composed key: 'year-week'
    const yearWeek = `${moment(date).year()}-${moment(date).week()}`;

    // add this key as a property to the result object
    if (!acc[yearWeek]) {
        acc[yearWeek] = [];
    }

    // push the current date that belongs to the year-week calculated befor
    acc[yearWeek].push(d);

    return acc;
}, {});

//   console.log(groups);

const newData = Object.entries(groups).map(([key, value]) => {
    console.log('key', key);
    let count = 0;
    let e2e = 0;
    let unit = 0;

    value.forEach((v) => {
        count += v.count;
        e2e += v.withE2ETest;
        unit += v.withUnitTest;
    });

    return {
        key,
        count,
        e2e,
        unit,
    };
});

console.log('newData', newData);

writeJsonToFile(newData, `new-${file}`);
