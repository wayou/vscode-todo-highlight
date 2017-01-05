var vscode = require('vscode');

let settings = vscode.workspace.getConfiguration('todohighlight');
let defaultStyle = settings.get('defaultStyle');

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

function getKeywords(setting, isCaseSensitive) {
    let result = DEFAULT_KEYWORDS;
    setting.forEach((v) => {
        v = typeof v == 'string' ? { text: v } : v;
        let text = v.text;
        if (!text) return;//NOTE: in case of the text is empty or note set in configuration file
        if (!isCaseSensitive) {
            text = text.toUpperCase();
        }
        result[text] = Object.assign({}, DEFAULT_STYLE, defaultStyle, v);
    })
    return result;
}

module.exports = {
    DEFAULT_KEYWORDS,
    DEFAULT_STYLE,
    getKeywords
};

