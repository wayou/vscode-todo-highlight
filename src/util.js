var vscode = require('vscode');

var DEFAULT_KEYWORDS = {
    "TODO:": {
        text: "TODO:",
        color: '#fff',
        backgroundColor: '#ffbd2a',
        overviewRulerLane: vscode.OverviewRulerLane.Right,
        overviewRulerColor: '#FFF176',
    },
    "FIXME:": {
        text: "FIXME:",
        color: '#fff',
        backgroundColor: '#F06292',
        overviewRulerLane: vscode.OverviewRulerLane.Right,
        overviewRulerColor: '#F06292',
    }
};

var DEFAULT_STYLE = {
    color: '#fff',
    backgroundColor: 'grey',
    // overviewRulerColor: '#F06292',
    overviewRulerLane: vscode.OverviewRulerLane.Right
};

function getKeywords(setting) {
    let result = DEFAULT_KEYWORDS;
    setting.forEach((v, i) => {
        v = typeof v == 'string' ? { text: v } : v;
        result[v.text] = Object.assign({}, DEFAULT_STYLE, v);
    })
    return result;
}

module.exports = {
    DEFAULT_KEYWORDS,
    DEFAULT_STYLE,
    getKeywords
};

