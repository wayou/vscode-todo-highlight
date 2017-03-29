/**
 * vscode plugin for highlighting TODOs and FIXMEs within your code
 * 
 * TODO:
 * - [x]highlight custom text
 * - [x]support custom colors
 * - [x]show corresponding message in status bar
 * - [x]list all todos in command pannel
 * - [x]add command to toggle the highlight
 * - [ ]cancellation support
 */

var vscode = require('vscode');
var util = require('./util');
var window = vscode.window;
var workspace = vscode.workspace;

function activate(context) {

    var timeout = null;
    var activeEditor = window.activeTextEditor;
    var isCaseSensitive, highlightWholeLine, customDefaultStyle, assembledData, decorationTypes, pattern;
    var workspaceState = context.workspaceState;

    var settings = workspace.getConfiguration('todohighlight');

    init(settings);

    vscode.commands.registerCommand('todohighlight.toggleHighlight', function () {
        settings.update('isEnable', !settings.get('isEnable'), true).then(function () {
            triggerUpdateDecorations();
        });
    });

    vscode.commands.registerCommand('todohighlight.listAnnotations', function () {
        if (!assembledData) return;
        var availableAnnotationTypes = Object.keys(assembledData);
        availableAnnotationTypes.unshift('ALL');
        util.chooseAnnotationType(availableAnnotationTypes).then(function (annotationType) {
            if (!annotationType) return;
            util.searchAnnotations(workspaceState, annotationType, availableAnnotationTypes, util.annotationsFound);
        });
    });

    vscode.commands.registerCommand('todohighlight.showOutputChannel', function () {
        var annotationList = workspaceState.get('annotationList', []);
        util.showOutputChannel(annotationList);
    });


    if (activeEditor) {
        triggerUpdateDecorations();
    }

    window.onDidChangeActiveTextEditor(function (editor) {
        activeEditor = editor;
        if (editor) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);

    workspace.onDidChangeTextDocument(function (event) {
        if (activeEditor && event.document === activeEditor.document) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);

    workspace.onDidChangeConfiguration(function () {
        settings = workspace.getConfiguration('todohighlight');

        //NOTE: if disabled, do not re-initialize the data or we will not be able to clear the style immediatly via 'toggle highlight' command
        if (!settings.get('isEnable')) return;

        init(settings);
        triggerUpdateDecorations();
    }, null, context.subscriptions);

    function updateDecorations() {

        if (!activeEditor || !activeEditor.document) {
            return;
        }

        var text = activeEditor.document.getText();
        var mathes = {}, match;
        while (match = pattern.exec(text)) {
            var startPos = activeEditor.document.positionAt(match.index);
            var endPos = activeEditor.document.positionAt(match.index + match[0].length);
            var decoration = {
                range: new vscode.Range(startPos, endPos)
            };

            var matchedValue = match[0];
            if (!isCaseSensitive) {
                matchedValue = matchedValue.toUpperCase();
            }
            mathes[matchedValue] ? mathes[matchedValue].push(decoration) : (mathes[matchedValue] = [decoration]);
        }

        Object.keys(decorationTypes).forEach((v) => {
            if (!isCaseSensitive) {
                v = v.toUpperCase();
            }

            let rangeOption = !(settings.get('isEnable') && mathes[v]) ? [] : mathes[v]; //NOTE: fix #5

            activeEditor.setDecorations(decorationTypes[v], rangeOption);
        })
    }

    function init(settings) {
        isCaseSensitive = settings.get('isCaseSensitive', true);
        highlightWholeLine = settings.get('highlightWholeLine', false);
        customDefaultStyle = settings.get('defaultStyle');
        assembledData = util.getAssembledData(settings.get('keywords'), customDefaultStyle, isCaseSensitive);

        if (!window.statusBarItem) {
            window.statusBarItem = util.createStatusBarItem();
        }
        if (!window.outputChannel) {
            window.outputChannel = window.createOutputChannel('TodoHighlight');
        }

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

            mergedStyle.isWholeLine = highlightWholeLine;

            mergedStyle.overviewRulerLane = vscode.OverviewRulerLane.Right;

            decorationTypes[v] = window.createTextEditorDecorationType(mergedStyle);
        })

        var keywords = Object.keys(assembledData).join('|');
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
