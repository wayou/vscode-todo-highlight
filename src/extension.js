/**
 * vscode plugin for highlighting TODOs and FIXMEs within your code
 * 
 * TODO:
 * - [x]highlight custom text
 * - [x]support custom colors
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

    let isCaseSensitive, customDefaultStyle, assembledData, decorationTypes, pattern;

    let settings = vscode.workspace.getConfiguration('todohighlight');

    let zeroPos = activeEditor.document.positionAt(0);
    let clearRange = [{ range: new vscode.Range(zeroPos, zeroPos) }];

    init(settings);

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

        // NOTE: LET THE USER CONFIG TAKES EFFECT ON THE FLY WITHOUT RELOAD THE VSCODE
        // since vscode doesn't provide an api to indicate when the user settings changes,
        // let's get the config everytime before we set the highlight.
        // but regarding the performance, we do a check wheter there's diff between the current config and the previous one,
        // only regenerate keywords when there's diff
        let currentSetting = vscode.workspace.getConfiguration('todohighlight');
        if (JSON.stringify(settings) != JSON.stringify(currentSetting)) {
            settings = currentSetting;
            init(settings);
        }

        let text = activeEditor.document.getText();
        let mathes = {}, match;
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

        Object.keys(decorationTypes).forEach((v) => {
            if (!isCaseSensitive) {
                v = v.toUpperCase()
            }
            let rangesOrOptions = mathes[v] || clearRange; //NOTE: fix #5
            activeEditor.setDecorations(decorationTypes[v], rangesOrOptions);
        })
    }

    function init(settings) {
        isCaseSensitive = settings.get('isCaseSensitive', true);
        customDefaultStyle = settings.get('defaultStyle');
        assembledData = util.getAssembledData(settings.get('keywords'), customDefaultStyle, isCaseSensitive);
        decorationTypes = {};

        Object.keys(assembledData).forEach((v) => {
            if (!isCaseSensitive) {
                v = v.toUpperCase()
            }

            let mergedStyle = Object.assign({}, assembledData[v]);

            if (!mergedStyle.overviewRulerColor) {
                // using backgroundColor as the default overviewRulerColor if not specified by the user setting
                mergedStyle.overviewRulerColor = mergedStyle.backgroundColor;
            }
            mergedStyle.overviewRulerLane = vscode.OverviewRulerLane.Right;

            decorationTypes[v] = vscode.window.createTextEditorDecorationType(mergedStyle);
        })

        let keywords = Object.keys(assembledData).join('|');
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
