/**
 * vscode plugin for highlighting TODOs and FIXMEs within your code
 * 
 * TODO:
 * - [x]highlight customized text
 * - [x]support customizing colors
 * - show corresponding message in status bar
 * - list all todos in command pannel
 * - add command to toggle the highlight
 * - language servers implementation
 * - show new release welcome message for every updates
 */

var vscode = require('vscode');
var util = require('./util');

function activate(context) {

    let timeout = null;

    let activeEditor = vscode.window.activeTextEditor;

    let settings = vscode.workspace.getConfiguration('todohighlight');
    let isCaseSensitive = settings.get('isCaseSensitive', true);

    let keywordsData = util.getKeywords(settings.get('keywords'), isCaseSensitive);

    let decorationTypes = {};

    Object.keys(keywordsData).forEach((v) => {
        if (!isCaseSensitive) {
            v = v.toUpperCase()
        }
        let mergedStyle = Object.assign({}, keywordsData[v]);
        mergedStyle.overviewRulerColor = mergedStyle.backgroundColor;
        decorationTypes[v] = vscode.window.createTextEditorDecorationType(mergedStyle);
    })

    let keywords = Object.keys(keywordsData).join('|');
    let pattern = new RegExp(keywords, 'g');
    if (!isCaseSensitive) {
        pattern = new RegExp(keywords, 'gi');
    }

    if (activeEditor) {
        triggerUpdateDecorations();
    }

    vscode.window.onDidChangeActiveTextEditor(function (editor) {
        activeEditor = editor;
        if (editor) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(function (event) {
        if (activeEditor && event.document === activeEditor.document) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);

    function updateDecorations() {

        if (!activeEditor) {
            return;
        }

        let text = activeEditor.document.getText();
        let mathes = {};
        let match;
        while (match = pattern.exec(text)) {
            let startPos = activeEditor.document.positionAt(match.index);
            let endPos = activeEditor.document.positionAt(match.index + match[0].length);
            let decoration = {
                range: new vscode.Range(startPos, endPos),
                // TODO: parse and show corresponding content in popup panel when hover
                // hoverMessage: ``
            };

            let matchedValue = match[0];
            if (!isCaseSensitive) {
                matchedValue = matchedValue.toUpperCase()
            }
            mathes[matchedValue] ? mathes[matchedValue].push(decoration) : (mathes[matchedValue] = [decoration]);
        }

        Object.keys(mathes).forEach((v) => {
            if (!isCaseSensitive) {
                v = v.toUpperCase()
            }
            activeEditor.setDecorations(decorationTypes[v], mathes[v]);
        })

    }
    function triggerUpdateDecorations() {
        timeout && clearTimeout(timeout);
        timeout = setTimeout(updateDecorations, 0);
    }
}

exports.activate = activate;
