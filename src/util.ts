import * as os from "os";
import * as vscode from "vscode";
import { workspace, WorkspaceFolder } from "vscode";
import * as pkg from "../package.json";
import { GITHUB_HEADER_SIZE_LIMIT } from "./consts";

export function getIssueUrl(error: any) {
  const breakSymbol = "%0A";
  const envInfo = `OS: ${os.platform()} ${os.release()}  ${breakSymbol} ${
    vscode.env.appName
  }: ${vscode.version} ${breakSymbol} ${(pkg as any).name}: ${
    (pkg as any).version
  }`;
  let formatedStack = "no stack info.";
  const stack = error.stack;
  if (stack) {
    if (typeof stack === "string") {
      formatedStack = stack;
    } else if (stack.join) {
      formatedStack = stack.join(breakSymbol);
    }
  }
  const errorInfo = `
  \`\`\`${breakSymbol}
  ${error.name}:${error.message} ${breakSymbol}${breakSymbol} ${formatedStack}
  ${breakSymbol}\`\`\`
  `;
  const body = encodeURI(`${envInfo}${breakSymbol}${breakSymbol}${errorInfo}`);
  const bodyWithoutErrorStack = encodeURI(`${envInfo}`);
  let url = `${(pkg as any).bugs.url}/new?title=&body=${body}`;
  if (url.length > GITHUB_HEADER_SIZE_LIMIT) {
    url = `${(pkg as any).bugs.url}/new?title=&body=${bodyWithoutErrorStack}`;
  }
  return url;
}

export function getCurrentWorkspace(): WorkspaceFolder | undefined {
  if (workspace.workspaceFolders === undefined) {
    return undefined;
  }
  return workspace.workspaceFolders.filter((i) => i.name === workspace.name)[0];
}

export function getGlobPattern(source: string | string[]): string {
  return Array.isArray(source)
    ? "{" + source.join(",") + "}"
    : typeof source === "string"
      ? source
      : "";
}

export function errorHandler(error: any, msg?: string): void {
  const actions = ["FILE AN ISSUE", "CLOSE"];
  vscode.window
    .showErrorMessage(
      `${error.name || "Error"}:${msg || error.message || '"unknown error"'}`,
      ...actions,
    )
    .then((action) => {
      if (action === actions[0]) {
        vscode.commands.executeCommand(
          "vscode.open",
          vscode.Uri.parse(getIssueUrl(error)),
        );
      }
    });
}

export interface IProgressType {
  message?: string | undefined;
  increment?: number | undefined;
}
