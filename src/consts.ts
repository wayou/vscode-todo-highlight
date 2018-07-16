/*
 * @author: wayou
 * @date: 2018-07-15 15:35:30
 * @description:
 */

export const PUBLISHER_NAME = "wayou";
export const EXTENSION_NAME = "vscode-todo-highlight";
export const EXTENSION_NAMESPACE = "todohighlight";

// urls longer than this will raise github `414 Request-URI Too Large` error
export const GITHUB_HEADER_SIZE_LIMIT = 8195;

export enum CommandTypes {
  TOGGLE_HIGHLIGHT = "todohighlight.toggleHighlight",
  TOGGLE_URI = "todohighlight.toggleURI",
  LIST_ANNOTATIONS = "todohighlight.listAnnotations",
  LIST_ALL_ANNOTATIONS = "todohighlight.listAllAnnotations",
}
