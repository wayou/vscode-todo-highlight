
var DEFAULT_KEYWORDS = {
    "TODO:": {
        text: "TODO:",
        color: '#fff',
        backgroundColor: '#ffbd2a',
        overviewRulerColor: 'rgba(255,189,42,0.8)'
    },
    "FIXME:": {
        text: "FIXME:",
        color: '#fff',
        backgroundColor: '#f06292',
        overviewRulerColor: 'rgba(240,98,146,0.8)'
    }
};

var DEFAULT_STYLE = {
    color: "#0000ff",
    backgroundColor: "yellow",
};

function getAssembledData(setting, customDefaultStyle, isCaseSensitive) {
    let result = JSON.parse(JSON.stringify(DEFAULT_KEYWORDS));
    setting.forEach((v) => {
        v = typeof v == 'string' ? { text: v } : v;
        let text = v.text;
        if (!text) return;//NOTE: in case of the text is empty or note set in configuration file
        if (!isCaseSensitive) {
            text = text.toUpperCase();
        }
        result[text] = Object.assign({}, DEFAULT_STYLE, customDefaultStyle, v);
    })

    return result;
}

module.exports = {
    getAssembledData
};

