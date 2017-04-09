var fs = require('fs');

function loadData() {
    return JSON.parse(fs.readFileSync('nodes.json'));
}

let obj = loadData();
console.log(obj.nodes);
