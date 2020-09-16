const fse = require('fs-extra');

function writeJsonToFile(data, filename) {
    fse.writeJson(filename, data)
        .then(() => console.log('Successfully written:', filename))
        .catch((err) => console.error(err));
}

function readJsonFromFile(file) {
    try {
        return fse.readJsonSync(file);
    } catch (err) {
        return {err};
    }
}

module.exports = {
    readJsonFromFile,
    writeJsonToFile,
};
