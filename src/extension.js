/**
 * vs code plugin for highlighting TODOs and FIXMEs within your code
 * TODO:
 * - show corresponding message in status bar
 * - list all todos in command pannel
 * - highlight customized text
 * - add command to toggle the highlight
 * - https://github.com/Microsoft/vscode-eslint/blob/master/eslint/extension.ts
 * - https://code.visualstudio.com/docs/extensionAPI/extension-points#_contributesconfiguration
 * - Language Servers implementation
 */

var vscode = require('vscode');
var util = require('./util');

function activate(context) {

    var timeout = null;

    var activeEditor = vscode.window.activeTextEditor;

    var settings = vscode.workspace.getConfiguration('todohighlight');
    let keywordsData = util.getKeywords(settings.get('keywords'));
    let isCaseSensitive = settings.get('isCaseSensitive');

    var decorationTypes = {};

    Object.keys(keywordsData).forEach((v) => {
        if (!isCaseSensitive) {
            v = v.toLowerCase()
        }
        decorationTypes[v] = vscode.window.createTextEditorDecorationType(Object.assign({}, util.DEFAULT_STYLE, keywordsData[v]));
    })
    console.log('decorationTypes',JSON.stringify(decorationTypes));
    

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

        var text = activeEditor.document.getText();
        var mathes = {};
        var match;
        while (match = pattern.exec(text)) {
            var startPos = activeEditor.document.positionAt(match.index);
            var endPos = activeEditor.document.positionAt(match.index + match[0].length);
            var decoration = {
                range: new vscode.Range(startPos, endPos),
                //TODO: parse and show todo index
                // hoverMessage: `TODO#${match.index}`
            };

            var matchedValue = match[0];
            if (!isCaseSensitive) {
                matchedValue = matchedValue.toLowerCase()
            }
            mathes[matchedValue] ? mathes[matchedValue].push(decoration) : (mathes[matchedValue] = [decoration]);
        }

        Object.keys(mathes).forEach((v) => {
            if (!isCaseSensitive) {
                v = v.toLowerCase()
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
