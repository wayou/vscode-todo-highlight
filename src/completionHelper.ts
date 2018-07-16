import * as vscode from "vscode";
import { IConfigAnnotation } from "./configHelper";

export interface ICompletions {
  [pattern: string]: vscode.CompletionItem;
}

let completionItemProvider: vscode.Disposable;

/**
 * update the completion registed to the editor
 * @param config a instance of `WorkspaceConfiguration`
 */
export function updateCompletions(config: vscode.WorkspaceConfiguration) {
  const configAnnotations = config.get<Array<string | IConfigAnnotation>>(
    "keywords",
    [],
  );
  const completions: vscode.CompletionItem[] = configAnnotations.map(
    (annotation: string | IConfigAnnotation) => {
      const pattern =
        typeof annotation === "object" ? annotation.pattern : annotation;
      const description =
        typeof annotation === "object" && annotation.description
          ? annotation.description
          : "";
      const item = new vscode.CompletionItem(
        pattern,
        vscode.CompletionItemKind.Text,
      );
      if (description) {
        item.documentation = description;
      }
      return item;
    },
  );

  if (completionItemProvider) {
    completionItemProvider.dispose();
  }
  completionItemProvider = vscode.languages.registerCompletionItemProvider(
    {
      scheme: "file",
    },
    {
      provideCompletionItems() {
        return completions;
      },
    },
  );
}
