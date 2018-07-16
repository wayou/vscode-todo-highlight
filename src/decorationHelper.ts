/*
 * @author: wayou
 * @date: 2018-07-15 15:35:38
 * @description:
 */

import { debounce } from "ts-debounce";
import * as vscode from "vscode";
import { IAnnotations } from "./configHelper";

export interface ICurrentAnnotationItem {
  label: string;
  count: number;
  pattern: string;
}

export const updateDecorations = debounce(
  (
    config: vscode.WorkspaceConfiguration,
    annotations: IAnnotations,
    activeEditor: vscode.TextEditor | undefined,
    regExp: RegExp | undefined,
  ) => {
    const isCaseSensitive = config.get<boolean>("isCaseSensitive", true);
    const isEnable = config.get<boolean>("isEnable", true);
    const flag = isCaseSensitive ? "g" : "gi";
    if (!activeEditor || !regExp) {
      return [];
    }

    const text = activeEditor.document.getText();

    const tmpRanges: {
      [pattern: string]: vscode.Range[];
    } = {};

    let match: RegExpExecArray | null;
    // tslint:disable-next-line:no-conditional-assignment
    while ((match = regExp.exec(text))) {
      const matchedAnnotation = match[0];
      // reveal the pattern that generate the result
      const originalPattern = Object.keys(annotations).find((pattern) => {
        return new RegExp(`^${pattern}$`, flag).test(matchedAnnotation);
      });
      if (originalPattern) {
        const startPos = activeEditor.document.positionAt(match.index);
        const endPos = activeEditor.document.positionAt(
          match.index + match[0].length,
        );
        const range = new vscode.Range(startPos, endPos);

        if (!tmpRanges[originalPattern]) {
          tmpRanges[originalPattern] = [range];
        } else {
          tmpRanges[originalPattern].push(range);
        }
      }
    }

    Object.keys(annotations).forEach((pattern) => {
      const decorationType = annotations[pattern];
      if (isEnable && tmpRanges[pattern]) {
        activeEditor.setDecorations(decorationType, tmpRanges[pattern]);
      } else {
        activeEditor.setDecorations(decorationType, []);
      }
    });
  },
  50,
);

export function getAnnotationsInCurrentFile(
  activeEditor: vscode.TextEditor | undefined,
  regExp: RegExp | undefined,
  config: vscode.WorkspaceConfiguration,
  annotations: IAnnotations,
): ICurrentAnnotationItem[] {
  if (!activeEditor || !regExp) {
    return [];
  }
  const isCaseSensitive = config.get<boolean>("isCaseSensitive", true);
  const flag = isCaseSensitive ? "g" : "gi";
  const text = activeEditor.document.getText();
  // const result: string[] = [];
  const result: { [pattern: string]: ICurrentAnnotationItem } = {};
  let match: RegExpExecArray | null;
  // tslint:disable-next-line:no-conditional-assignment
  while ((match = regExp.exec(text))) {
    const matchedAnnotation = match[0];
    const originalPattern = Object.keys(annotations).find((pattern) => {
      return new RegExp(`^${pattern}$`, flag).test(matchedAnnotation);
    });
    if (originalPattern) {
      if (result[originalPattern]) {
        result[originalPattern].count += 1;
        result[originalPattern].pattern = originalPattern;
        result[originalPattern].label = `${originalPattern} (${
          result[originalPattern].count
        })`;
      } else {
        result[originalPattern] = {
          label: `${originalPattern} (1)`,
          count: 1,
          pattern: originalPattern,
        };
      }
    }
  }
  return Object.keys(result).map((key) => {
    return result[key];
  });
}
