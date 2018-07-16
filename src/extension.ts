/*
 * @author: wayou
 * @date: 2018-07-15 15:31:24
 * @description: a vscode extension add text decoration.
 */

import { ExtensionContext } from "vscode";

import HighlightExtension from "./HighlightExtension";

let highlightExtension: HighlightExtension;

export function activate(context: ExtensionContext) {
  highlightExtension = new HighlightExtension(context);
}

export function deactivate() {
  highlightExtension.cleanup();
}
