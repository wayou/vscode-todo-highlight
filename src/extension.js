/**
 * vscode plugin for highlighting TODOs and FIXMEs within your code
 *
 * NOTE: each decoration type has a unique key, the highlight and clear highight functionality are based on it
 */

var vscode = require('vscode');
var util = require('./util');
var window = vscode.window;
var workspace = vscode.workspace;

function activate(context) {

    var timeout = null;
    var activeEditor = window.activeTextEditor;
    var isCaseSensitive, assembledData, decorationTypes, pattern, styleForRegExp, keywordsPattern;
    var workspaceState = context.workspaceState;

    var settings = workspace.getConfiguration('todohighlight');

    init(settings);

    context.subscriptions.push(vscode.commands.registerCommand('todohighlight.toggleHighlight', function () {
        settings.update('isEnable', !settings.get('isEnable'), true).then(function () {
            triggerUpdateDecorations();
        });
    }))

    context.subscriptions.push(vscode.commands.registerCommand('todohighlight.listAnnotations', function () {
        if (keywordsPattern.trim()) {
            util.searchAnnotations(workspaceState, pattern, util.annotationsFound);
        } else {
            if (!assembledData) return;
            var availableAnnotationTypes = Object.keys(assembledData);
            availableAnnotationTypes.unshift('ALL');
            util.chooseAnnotationType(availableAnnotationTypes).then(function (annotationType) {
                if (!annotationType) return;
                var searchPattern = pattern;
                if (annotationType != 'ALL') {
                    annotationType = util.escapeRegExp(annotationType);
                    searchPattern = new RegExp(annotationType, isCaseSensitive ? 'g' : 'gi');
                }
                util.searchAnnotations(workspaceState, searchPattern, util.annotationsFound);
            });
        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand('todohighlight.showOutputChannel', function () {
        var annotationList = workspaceState.get('annotationList', []);
        util.showOutputChannel(annotationList);
    }));

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

            if (mathes[matchedValue]) {
                mathes[matchedValue].push(decoration);
            } else {
                mathes[matchedValue] = [decoration];
            }

            if (keywordsPattern.trim() && !decorationTypes[matchedValue]) {
                decorationTypes[matchedValue] = window.createTextEditorDecorationType(styleForRegExp);
            }
        }

        Object.keys(decorationTypes).forEach((v) => {
            if (!isCaseSensitive) {
                v = v.toUpperCase();
            }
            var rangeOption = settings.get('isEnable') && mathes[v] ? mathes[v] : [];
            var decorationType = decorationTypes[v];
            activeEditor.setDecorations(decorationType, rangeOption);
        })
    }

    function init(settings) {
        var customDefaultStyle = settings.get('defaultStyle');
        keywordsPattern = settings.get('keywordsPattern');
        isCaseSensitive = settings.get('isCaseSensitive', true);

        if (!window.statusBarItem) {
            window.statusBarItem = util.createStatusBarItem();
        }
        if (!window.outputChannel) {
            window.outputChannel = window.createOutputChannel('TodoHighlight');
        }

        decorationTypes = {};

        if (keywordsPattern.trim()) {
            styleForRegExp = Object.assign({}, util.DEFAULT_STYLE, customDefaultStyle, {
                overviewRulerLane: vscode.OverviewRulerLane.Right
            });
            pattern = keywordsPattern;
        } else {
            assembledData = util.getAssembledData(settings.get('keywords'), customDefaultStyle, isCaseSensitive);
            Object.keys(assembledData).forEach((v) => {
                if (!isCaseSensitive) {
                    v = v.toUpperCase()
                }

                var mergedStyle = Object.assign({}, {
                    overviewRulerLane: vscode.OverviewRulerLane.Right
                }, assembledData[v]);

                if (!mergedStyle.overviewRulerColor) {
                    // use backgroundColor as the default overviewRulerColor if not specified by the user setting
                    mergedStyle.overviewRulerColor = mergedStyle.backgroundColor;
                }

                decorationTypes[v] = window.createTextEditorDecorationType(mergedStyle);
            });

            pattern = Object.keys(assembledData).map((v) => {
                return util.escapeRegExp(v);
            }).join('|');
        }

        pattern = new RegExp(pattern, 'gi');
        if (isCaseSensitive) {
            pattern = new RegExp(pattern, 'g');
        }

    }

    function triggerUpdateDecorations() {
        timeout && clearTimeout(timeout);
        timeout = setTimeout(updateDecorations, 0);
    }
}

exports.activate = activate;
