/**
 * vscode plugin for highlighting TODOs and FIXMEs within your code
 *
 * TODO:
 * - [x]highlight custom text
 * - [x]support custom colors
 * - show corresponding message in status bar
 * - list all todos in command pannel
 * - [x]add command to toggle the highlight
 * - show new release welcome message for every updates
 */

var vscode = require('vscode');
var util = require('./util');

function activate(context) {

    var timeout = null;

    var activeEditor = vscode.window.activeTextEditor;

    var wholeWords, isCaseSensitive, customDefaultStyle, assembledData, decorationTypes, pattern;

    var settings = vscode.workspace.getConfiguration('todohighlight');

    init(settings);

    vscode.commands.registerCommand('todohighlight.toggleHighlight', function () {
        settings.update('isEnable', !settings.get('isEnable'), true).then(function () {
            triggerUpdateDecorations();
        });
    });

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

    vscode.workspace.onDidChangeConfiguration(function (event) {
        settings = vscode.workspace.getConfiguration('todohighlight');

        //NOTE: if disabled, do not re-initialize the data or we will not be able to clear the style immediatly via 'toggle highlight' command
        if (!settings.get('isEnable')) return;

        init(settings);
        triggerUpdateDecorations();
    }, null, context.subscriptions);

    function updateDecorations() {

        if (!activeEditor) {
            return;
        }

        var zeroPos = activeEditor.document.positionAt(0);
        var clearRange = [{ range: new vscode.Range(zeroPos, zeroPos) }];

        var text = activeEditor.document.getText();
        var matches = {}, match;
        while (match = pattern.exec(text)) {
            var matchedValue = match[0].trim(),
                startPos = match.index,
                endPos = match.index + matchedValue.length;

            // get rid of leading whitespaces
            if (wholeWords) {
                var leadingWhitespace = RegExp('\\s+').exec(match[0]);
                if (leadingWhitespace) {
                    startPos += leadingWhitespace[0].length;
                    endPos += leadingWhitespace[0].length;
                }
            }

            var decoration = {
                range: new vscode.Range(activeEditor.document.positionAt(startPos),
                                        activeEditor.document.positionAt(endPos))
                // TODO: parse and show corresponding content in popup panel when hover
                // hoverMessage: ``
            };

            if (!isCaseSensitive) {
                matchedValue = matchedValue.toUpperCase();
            }
            matches[matchedValue] ? matches[matchedValue].push(decoration) : (matches[matchedValue] = [decoration]);
        }

        Object.keys(decorationTypes).forEach((v) => {
            if (!isCaseSensitive) {
                v = v.toUpperCase();
            }

            let rangeOption = !(settings.get('isEnable') && matches[v]) ? clearRange : matches[v]; //NOTE: fix #5

            activeEditor.setDecorations(decorationTypes[v], rangeOption);
        })
    }

    function init(settings) {
        wholeWords = settings.get('wholeWords', true);
        isCaseSensitive = settings.get('isCaseSensitive', true);
        customDefaultStyle = settings.get('defaultStyle');
        assembledData = util.getAssembledData(settings.get('keywords'), customDefaultStyle, isCaseSensitive);

        decorationTypes = {};

        Object.keys(assembledData).forEach((v) => {
            if (!isCaseSensitive) {
                v = v.toUpperCase()
            }

            var mergedStyle = Object.assign({}, assembledData[v]);

            if (!mergedStyle.overviewRulerColor) {
                // using backgroundColor as the default overviewRulerColor if not specified by the user setting
                mergedStyle.overviewRulerColor = mergedStyle.backgroundColor;
            }
            mergedStyle.overviewRulerLane = vscode.OverviewRulerLane.Right;

            decorationTypes[v] = vscode.window.createTextEditorDecorationType(mergedStyle);
        });

        if (wholeWords) {
            var keywords = '\\s+' + Object.keys(assembledData).join('\\s+|\\s+') + '\\s+';
        } else {
            var keywords = Object.keys(assembledData).join('|');
        }

        pattern = new RegExp(keywords, 'g');
        if (!isCaseSensitive) {
            pattern = new RegExp(keywords, 'gi');
        }
    }

    function triggerUpdateDecorations() {
        timeout && clearTimeout(timeout);
        timeout = setTimeout(updateDecorations, 0);
    }
}

exports.activate = activate;
