/*
 * @author: wayou
 * @date: 2018-07-15 15:35:11
 * @description:
 */

// tslint:disable:no-console

import { platform } from "os";
import * as vscode from "vscode";
import { updateCompletions } from "./completionHelper";
import {
  getAnnotationTypes,
  getConfig,
  getRegExpBySelection,
  IAnnotations,
  updatePatternData,
} from "./configHelper";
import { EXTENSION_NAMESPACE } from "./consts";
import { CommandTypes } from "./consts";
import {
  getAnnotationsInCurrentFile,
  ICurrentAnnotationItem,
  updateDecorations,
} from "./decorationHelper";
import {
  errorHandler,
  getCurrentWorkspace,
  getGlobPattern,
  IProgressType,
} from "./util";

export default class HighlightExtension {
  private context: vscode.ExtensionContext;
  private activeEditor: vscode.TextEditor | undefined;
  private config: vscode.WorkspaceConfiguration;
  private annotations: IAnnotations = {};
  private regExp: RegExp | undefined;
  private processing: boolean = false;
  private outputChannel: vscode.OutputChannel;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.activeEditor = vscode.window.activeTextEditor;
    this.config = getConfig();
    this.outputChannel = vscode.window.createOutputChannel(EXTENSION_NAMESPACE);
    this.init();
  }

  public init() {
    this.registCommands(this.context);
    this.setupEvents();

    this.updateData();
  }

  public cleanup() {
    return undefined;
  }

  private updateData() {
    this._updatePatternData();
    this._updateCompletions();
    this._updateDecorations();
  }

  private _updateDecorations() {
    updateDecorations(
      this.config,
      this.annotations,
      this.activeEditor,
      this.regExp,
    );
  }

  private _updatePatternData() {
    const result = updatePatternData(this.config, this.annotations);
    this.regExp = result.regExp;
    this.annotations = result.annotations;
  }

  private _updateCompletions() {
    updateCompletions(this.config);
  }

  /**
   *  process the file search
   * @param files a set of `Uri`s to process
   * @param choosenAnnotationType a set of selected annotation types to search
   * @param progress a `Progress` represents the processing progress
   * @param cancelToken a token witch cancels the task
   */
  private async processFiles(
    files: vscode.Uri[],
    choosenAnnotationType: string[],
    progress: vscode.Progress<IProgressType>,
    cancelToken: vscode.CancellationToken,
  ) {
    let annotationCount = 0;
    let index = 0;
    const totalFilesCount = files.length;
    const regExp = getRegExpBySelection(choosenAnnotationType);
    this.outputChannel.clear();

    const toggleURI = this.config.get("toggleURI", false);
    // NOTE: see issue https://github.com/Microsoft/vscode/issues/586
    let uriSymbol = toggleURI ? "#" : ":";
    if (platform() === "linux") {
      uriSymbol = toggleURI ? ":" : "#";
    }

    const processFile = async (file: vscode.Uri): Promise<void> => {
      const relativeFilePath = vscode.workspace.asRelativePath(file.fsPath);
      progress.report({
        message: `${index + 1}/${totalFilesCount} ${relativeFilePath}`,
        increment: index / totalFilesCount,
      });

      try {
        const textDocument = await vscode.workspace.openTextDocument(file);
        // ---- annotation parse start ----
        const fileContent = textDocument.getText();
        let match: RegExpExecArray | null;
        // tslint:disable-next-line:no-conditional-assignment
        while ((match = regExp.exec(fileContent))) {
          annotationCount++;
          const positionOfMatchedAnnotation = textDocument.positionAt(
            match.index,
          );
          const line = positionOfMatchedAnnotation.line;
          const col = positionOfMatchedAnnotation.character;
          const ouputContent = textDocument.getText(
            new vscode.Range(
              positionOfMatchedAnnotation,
              textDocument.lineAt(line).range.end,
            ),
          );

          const colPosition = uriSymbol === "#" ? "" : `${uriSymbol}${col + 1}`;
          const fileURI = `${file.path}${uriSymbol}${line + 1}${colPosition}`;

          this.outputChannel.appendLine(
            `#${annotationCount}: ${fileURI} \n${ouputContent}\n`,
          );
        }
        // ---- annotation parse end ----

        if (
          index < totalFilesCount - 1 &&
          !cancelToken.isCancellationRequested
        ) {
          index++;
          return processFile(files[index]);
        } else {
          this.fileProcessDone(index, annotationCount);
          Promise.resolve();
        }
      } catch (error) {
        console.log(`open ${file.fsPath} failed, \n ${error}`);
        // NOTE: cause all file types are included by default for the user convenience,
        // (no need to manully config the `include` option)
        // here we need to skip errors that raised by opening a none-text file, a binary file for example.
        // continue to next and ignore the error
        // reject(reason);
        this.fileProcessDone(index, annotationCount);
      }
    };
    return processFile(files[index]);
  }

  private fileProcessDone(index: number, annotationCount: number) {
    console.log(`file processing done!`);
    this.outputChannel.appendLine(
      `Searched ${index + 1} file(s), found ${annotationCount} annotation(s).`,
    );
    this.outputChannel.appendLine(
      "Tip: If the file uri's not clickable, try config `todohighlight.toggleURI` to `true`.",
    );
    this.outputChannel.show();
  }

  /**
   *
   * @param choosenAnnotationType the selected pattern
   * @param isListAll search current file or whole project
   */
  private listAnnotations(
    choosenAnnotationType: string[],
    isListAll: boolean = false,
  ) {
    if (this.processing) {
      vscode.window.showInformationMessage(
        `[${EXTENSION_NAMESPACE}] Searching already in progress, cancel the previous to start new search.`,
      );
      return;
    }

    vscode.window
      .withProgress(
        {
          cancellable: true,
          location: vscode.ProgressLocation.Notification,
          title: `[${EXTENSION_NAMESPACE}] searching annotations`,
        },
        (
          progress: vscode.Progress<IProgressType>,
          cancelToken: vscode.CancellationToken,
        ) => {
          this.processing = true;
          return this.searchTask(
            isListAll,
            cancelToken,
            choosenAnnotationType,
            progress,
          );
        },
      )
      .then(
        () => {
          this.processing = false;
          console.log("search progress done!");
        },
        (error: any) => {
          this.processing = false;
          errorHandler(error);
        },
      );
  }

  private async searchTask(
    isListAll: boolean,
    cancelToken: vscode.CancellationToken,
    choosenAnnotationType: string[],
    progress: vscode.Progress<IProgressType>,
  ) {
    const workspaceFolder = getCurrentWorkspace();
    if (!workspaceFolder) {
      return;
    }
    const include = new vscode.RelativePattern(
      workspaceFolder,
      getGlobPattern(this.config.get<string | string[]>("include", [])),
    );

    const exclude = getGlobPattern(
      this.config.get<string | string[]>("exclude", []),
    );

    let files: vscode.Uri[] = this.activeEditor
      ? [this.activeEditor.document.uri]
      : [];

    if (isListAll) {
      try {
        files = await vscode.workspace.findFiles(
          include,
          exclude,
          undefined,
          cancelToken,
        );
      } catch (error) {
        errorHandler(error);
      }
    }

    return this.processFiles(
      files,
      choosenAnnotationType,
      progress,
      cancelToken,
    );
  }

  /**
   * inital commands
   * @param context  ExtensionContext
   */
  private registCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(
      vscode.commands.registerCommand(CommandTypes.TOGGLE_HIGHLIGHT, () => {
        this.config
          .update("isEnable", !this.config.get("isEnable"), true)
          .then(() => {
            this.config = getConfig();
            this._updateDecorations();
          });
      }),
    );

    context.subscriptions.push(
      vscode.commands.registerCommand(CommandTypes.TOGGLE_URI, () => {
        this.config
          .update("toggleURI", !this.config.get("toggleURI"), false)
          .then(() => {
            this.config = getConfig();
            this._updateDecorations();
          });
      }),
    );

    context.subscriptions.push(
      vscode.commands.registerCommand(CommandTypes.LIST_ANNOTATIONS, () => {
        const annotationTypes = getAnnotationsInCurrentFile(
          this.activeEditor,
          this.regExp,
          this.config,
          this.annotations,
        );
        if (annotationTypes.length === 0) {
          vscode.window.showInformationMessage(
            `No annotations found in current file.`,
          );
          return;
        }
        vscode.window
          .showQuickPick<ICurrentAnnotationItem>(annotationTypes, {
            placeHolder: `select annotations to list within current file...`,
            canPickMany: true,
          })
          .then((choosenAnnotationTypes) => {
            if (choosenAnnotationTypes && choosenAnnotationTypes.length > 0) {
              const annotations = choosenAnnotationTypes.map((item) => {
                return item.pattern;
              });
              this.listAnnotations(annotations);
            } else {
              vscode.window.showInformationMessage(
                `[${EXTENSION_NAMESPACE}] no items are chosen.`,
              );
            }
          });
      }),
    );

    context.subscriptions.push(
      vscode.commands.registerCommand(CommandTypes.LIST_ALL_ANNOTATIONS, () => {
        const annotationTypes = getAnnotationTypes(this.annotations);
        vscode.window
          .showQuickPick(annotationTypes, {
            placeHolder: `pick annotations to search...`,
            canPickMany: true,
          })
          .then((choosenAnnotationType) => {
            if (choosenAnnotationType && choosenAnnotationType.length > 0) {
              this.listAnnotations(choosenAnnotationType, true);
            } else {
              vscode.window.showInformationMessage(
                `[${EXTENSION_NAMESPACE}] dismissed for no items are choosen.`,
              );
            }
          });
      }),
    );
  }

  /**
   * events binding
   */
  private setupEvents() {
    vscode.window.onDidChangeActiveTextEditor(
      (editor) => {
        this.activeEditor = editor;
        if (editor) {
          this._updateDecorations();
        }
      },
      this,
      this.context.subscriptions,
    );

    vscode.workspace.onDidChangeTextDocument(
      (event) => {
        if (
          this.activeEditor &&
          event.document === this.activeEditor.document
        ) {
          this._updateDecorations();
        }
      },
      this,
      this.context.subscriptions,
    );

    vscode.workspace.onDidChangeConfiguration(
      (event) => {
        if (event.affectsConfiguration(EXTENSION_NAMESPACE)) {
          this.config = getConfig();
          this.updateData();
        }
      },
      this,
      this.context.subscriptions,
    );
  }
}
