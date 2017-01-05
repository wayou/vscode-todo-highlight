var vscode = require('vscode');

let settings = vscode.workspace.getConfiguration('todohighlight');
let defaultStyle = settings.get('defaultStyle');
defaultStyle = { //Note: setting values manually to prevent user from putting extra values
    color: defaultStyle.color,
    backgroundColor: defaultStyle.backgroundColor,
    overviewRulerColor: defaultStyle.rulerColor,
    overviewRulerLane: vscode.OverviewRulerLane.Right,
}

//getDecorations
function getDecorations(settings, isCaseSensitive) {
    let result = {};
    settings.forEach((s) => {
        s = typeof s == 'string' ? { text: s } : s;
        let text = s.text;
        if (!text) return; //NOTE: in case of the text is empty or not set in configuration file
        if (!isCaseSensitive) {
            text = text.toUpperCase();
        }
        result[text] = Object.assign({}, defaultStyle)

        let val = { //Note: setting values manually to prevent user from putting extra values
            color: s.color,
            backgroundColor: s.backgroundColor,
            overviewRulerColor: s.rulerColor,
        };

        Object.keys(val).forEach((k) => { //NOTE: removing properties that arent set so it wont overwrite defaultStyle
            if (val[k] == undefined) {
                delete val[k]
            } 
        })

        result[text] = Object.assign({}, defaultStyle, val);
    });
    return result;
}

module.exports = {
    getDecorations
};

