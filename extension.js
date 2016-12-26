/**
 * vs code plugin for highlighting TODOs and FIXMEs within your code
 */

var vscode = require('vscode');

var timeout = null;

var TODO_PATTERN = /TODO:/gi;
var FIXME_PATTERN = /FIXME:/gi;

var TODO_STYLE = {
    overviewRulerLane: vscode.OverviewRulerLane.Right,
    overviewRulerColor: '#FFF176',
    light: {
        // this color will be used in light color themes
        backgroundColor: '#FFF176'
    },
    dark: {
        // this color will be used in dark color themes
        color: '#fff',
        backgroundColor: 'grey'
    }
};
var FIXME_STYLE = {
    overviewRulerLane: vscode.OverviewRulerLane.Right,
    overviewRulerColor: '#F06292',
    backgroundColor: '#F06292',
    light: {
        color: '#fff'
    },
    dark: {
        // this color will be used in dark color themes
        color: '#fff'
    }
};

function activate(context) {
    var todoDecorationType = vscode.window.createTextEditorDecorationType(TODO_STYLE);
    var fixMeDecorationType = vscode.window.createTextEditorDecorationType(FIXME_STYLE);
    var activeEditor = vscode.window.activeTextEditor;

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

    function triggerUpdateDecorations() {
        timeout && clearTimeout(timeout);
        timeout = setTimeout(updateDecorations, 0);
    }

    function updateDecorations() {
        if (!activeEditor) {
            return;
        }
        var text = activeEditor.document.getText();
        var todos = [];
        var fixmes = [];
        var match;
        while (match = TODO_PATTERN.exec(text)) {
            var startPos = activeEditor.document.positionAt(match.index);
            var endPos = activeEditor.document.positionAt(match.index + match[0].length);
            var decoration = {
                range: new vscode.Range(startPos, endPos),
                //TODO: parse and show todo content
                hoverMessage: ''
            };
            todos.push(decoration);
        }
        while (match = FIXME_PATTERN.exec(text)) {
            var startPos = activeEditor.document.positionAt(match.index);
            var endPos = activeEditor.document.positionAt(match.index + match[0].length);
            var decoration = {
                range: new vscode.Range(startPos, endPos),
                //TODO: parse and show fixme content
                hoverMessage: ''
            };
            fixmes.push(decoration);
        }

        activeEditor.setDecorations(todoDecorationType, todos);
        activeEditor.setDecorations(fixMeDecorationType, fixmes);
    }
}
exports.activate = activate;