const moment = require('moment');
const argv = require('yargs').argv;

const {writeJsonToFile} = require('./utils/file');
const knexConnection = require('./knexfile');

const {cwd, repo} = argv;
const branch = 'master';

function getKnexClient() {
    const client = process.env.PRODUCTION ? knexConnection.production : knexConnection.development;
    return require('knex')(client); // eslint-disable-line global-require
}

const childProcess = require('child_process');
const spawn = childProcess.spawn;

(git = spawn('git', ['log', '--pretty=format:%H|%ad|%s%d|%an'], {cwd})),
    // buffer for data
    (buf = Buffer.alloc(0));

git.stdout.on('data', (data) => {
    buf = Buffer.concat([buf, data]);
});

git.stderr.on('data', (data) => {
    console.log(data.toString());
});

git.on('close', (code) => {
    const knexClient = getKnexClient();

    // convert to string and split based on end of line
    let subjects = buf.toString().split('\n');
    // pop the last empty string element
    subjects.pop();

    const commits = [];

    subjects.forEach(async (sub, i) => {
        console.log(i)
        if (sub && subjects[i + 1]) {
            const info = getInfo(sub);
            const nextInfo = getInfo(subjects[i + 1]);

            const changes = getChanges(info, nextInfo);

            const commit = {...info, ...changes, repo, branch, count: 1};
            commits.push(commit);
            // await knexClient('commits').insert(commit);
        }
    });

    writeJsonToFile(commits, `${repo}-${branch}.json`);
});

function getInfo(line) {
    const [hash, committed_at, title, author] = line.split('|');

    const dateCommitted = moment(committed_at);

    return {
        hash,
        title,
        author,
        committed_at,
        year_week: `${dateCommitted.year()}-${dateCommitted.week() + 1}`,
        year_month: `${dateCommitted.year()}-${dateCommitted.month() + 1}`,
        year: dateCommitted.year(),
        month: dateCommitted.month() + 1,
        week: dateCommitted.week() + 1,
    };
}

function getChanges(info, nextInfo) {
    const numStat = childProcess.spawnSync(
        'git',
        ['log', '--numstat', '--pretty="%H"', `${info.hash}...${nextInfo.hash}`],
        {cwd},
    );
    const codeChange = numStat.stdout.toString();

    let plus = 0;
    let minus = 0;

    codeChange.split('\n').forEach((line) => {
        const row = line.split('\t');
        if (row.length === 3) {
            const rowPlus = parseInt(row[0], 10) > 0 ? parseInt(row[0], 10) : 0;
            const rowMinus = parseInt(row[1], 10) > 0 ? parseInt(row[1], 10) : 0;

            plus += rowPlus;
            minus += rowMinus;
        }
    });

    const {e2e, unit} = getTest(codeChange);

    return {
        compared_to: nextInfo.hash,
        plus,
        minus,
        e2e,
        unit,
        with_test: unit || e2e,
    };
}

function getTest(codeChange) {
    const lines = codeChange.split('\n');

    const files = lines
        .map((l) => {
            const line = l.split('\t');
            if (!line || !line[2]) return null;
            return line[2];
        })
        .filter((f) => f);
    let e2e = 0;
    let unit = 0;
    for (const file of files) {
        if (file.includes('.test.tsx.snap') || file.includes('.test.jsx.snap') || file.includes('.test.js.snap')) {
            continue;
        }
        if (file.includes('_spec.')) {
            e2e = 1;
        }

        if (file.includes('.test.') || file.includes('_test.go') || file.includes('storetest')) {
            unit = 1;
        }
    }

    return {e2e, unit};
}
