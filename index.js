var request = require('request');
const {
    Parser
} = require('json2csv');
const fs = require('fs');
//log4j
var log4js = require('log4js');
var logger = log4js.getLogger("Github Data Extract");
logger.level = 'debug';

var fulldata = []

function getdatafromGit(id) {
    logger.debug(`[getdatafromGit] Started`)
    return new Promise(function (resolve, reject) {
        var options = {
            'method': 'GET',
            'url': `https://api.github.com/repositories?since=${id}`,
            'headers': {
                'user-agent': 'node.js',
                'Authorization': 'Bearer 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'
            }
        };
        request(options, function (error, response) {
            if (error) {

                return reject(error);
            } else {
                // console.log(response.body)
                resolve(response.body)
            }
        });
    })
}

function createCSV(data) {
    return new Promise(function (resolve, reject) {

        logger.debug(`[createCSV] Started`)

        const fastcsv = require('fast-csv');
        const fs = require('fs');
        const ws = fs.createWriteStream("out.csv");
        fastcsv
            .write(data, {
                headers: true
            })
            .pipe(ws);
    })

}

function checkData(res) {
    return new Promise(function (resolve, reject) {
        var data = JSON.parse(res)
        var count = Object.keys(data).length;
        data.forEach(function (item) {
            fulldata.push(item);
        });
        logger.debug(`[checkData] Response Length: ${count}`);
        logger.debug(`[checkData] Fulldata Length: ${fulldata.length}`);
        var lastId = data[data.length - 1].id
        logger.debug(`[checkData] Last Id: ${lastId}`);
        if (parseInt(fulldata.length) <= 300) // 1 lac
        {
            logger.debug(`[checkData] in Condition`)
            getdatafromGit(lastId).then((data) => {
                checkData(data)
            })
        } else {
            logger.debug(`[checkData] in Else`)

            createCSV(fulldata).then(() => {
                resolve('Okay')
            })
        }
    })
}

function mainExe() {
    return new Promise(function (resolve, reject) {
        fulldata = []
        var startid = 1;
        getdatafromGit(startid).then((data) => {
            checkData(data).then(() => {
                resolve('Okay')
            })
        })
    })
}

mainExe()