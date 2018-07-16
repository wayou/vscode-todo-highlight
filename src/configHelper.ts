/*
 * @author: wayou
 * @date: 2018-07-15 15:35:22
 * @description:
 */

import * as vscode from "vscode";
import { EXTENSION_NAMESPACE } from "./consts";
import { errorHandler } from "./util";

export interface IConfigAnnotation {
  pattern: string;
  style?: vscode.DecorationRenderOptions;
  description?: string;
}

export interface IAnnotations {
  [pattern: string]: vscode.TextEditorDecorationType;
}

interface IPatternData {
  regExp: RegExp;
  annotations: IAnnotations;
}

export function getConfig() {
  return vscode.workspace.getConfiguration(EXTENSION_NAMESPACE);
}

/**
 * - convert keywords to key-value object {[patter]:decorationType}
 * - merge all patterns into one regexp
 * @param {WorkspaceConfiguration} config
 * @param {IAnnotations} annotations
 * @returns {IPatternData}
 */
export function updatePatternData(
  config: vscode.WorkspaceConfiguration,
  annotations: IAnnotations,
): IPatternData {
  const configAnnotations = config.get<Array<string | IConfigAnnotation>>(
    "keywords",
    [],
  );
  const defaultStyle = config.get<vscode.DecorationRenderOptions>(
    "defaultStyle",
    {},
  );
  const regExp: string[] = [];
  configAnnotations.forEach((configAnnotation) => {
    getDecorationType(defaultStyle, annotations, configAnnotation);
    const patternString = getRegExp4Annotation(configAnnotation);
    if (patternString) {
      regExp.push(patternString);
    }
  });

  const flag = config.get("isCaseSensitive", true) ? "g" : "gi";

  return {
    regExp: new RegExp(`${regExp.join("|")}`, flag),
    annotations,
  };
}

// clear the existing ones and create new one based on the config
export function getDecorationType(
  defaultStyle: vscode.DecorationRenderOptions,
  types: IAnnotations,
  annotation: string | IConfigAnnotation,
) {
  try {
    const pattern =
      typeof annotation === "object" ? annotation.pattern : annotation;
    const style =
      typeof annotation === "object" && annotation.style
        ? annotation.style
        : defaultStyle;
    if (types[pattern]) {
      types[pattern].dispose();
    }
    types[pattern] = vscode.window.createTextEditorDecorationType(style);
  } catch (error) {
    errorHandler(
      error,
      "`todohighlight.keywords` does not match the schema, check and try again.",
    );
  }
}

function getRegExp4Annotation(
  annotation: string | IConfigAnnotation,
): string | undefined {
  try {
    return typeof annotation === "object" ? annotation.pattern : annotation;
  } catch (error) {
    errorHandler(
      error,
      "`todohighlight.keywords` does not match the schema, check and try again.",
    );
  }
}

export function getRegExpBySelection(choosenAnnotationType: string[]): RegExp {
  const flag = `g${getConfig().get("isCaseSensitive") ? "" : "i"}`;
  return new RegExp(choosenAnnotationType.join("|"), flag);
}

export const getAnnotationTypes = (annotations: IAnnotations): string[] => {
  const annotationTypes = Object.keys(annotations);
  return annotationTypes;
};
