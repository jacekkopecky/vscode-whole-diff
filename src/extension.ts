import * as vscode from "vscode";
import { DiffType } from "./types";
import { WholeDiffFS } from "./whole-diff-fs";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("whole-diff.showWholeDiff", showWholeDiff)
  );

  context.subscriptions.push(
    vscode.workspace.registerFileSystemProvider(
      "whole-diff-fs",
      new WholeDiffFS(),
      { isCaseSensitive: true, isReadonly: true }
    )
  );
}

// gleaned from runtime
interface CommandContext {
  id?: "index" | "workingTree" | "untracked";
  commit?: {
    sha?: string;
  };
}

async function showWholeDiff(context: CommandContext) {
  const type = getDiffType(context);
  if (!type) {
    vscode.window.showErrorMessage(
      "Whole Diff is unclear on what to diff, where did you click it?"
    );
    console.warn(
      "whole diff doesn't know what to diff from this context",
      context
    );
    return;
  }

  // open the patch as a document
  try {
    const uri = vscode.Uri.parse(scheme + ":/" + type);
    await vscode.commands.executeCommand("vscode.openWith", uri, "diffViewer");
  } catch (e) {
    console.warn("error opening whole diff", e);
    vscode.window.showErrorMessage("could not open whole diff");
  }
}

const scheme = "whole-diff-fs";

function getDiffType(context: CommandContext): DiffType | undefined {
  // todo remove the button from untracked changes; or else, what should I do when clicked on untracked?

  if (context.id === "workingTree") {
    return "working tree.diff";
  }

  if (context.id === "index") {
    return "staged changes.diff";
  }

  if (context.commit?.sha) {
    return `sha-${context.commit?.sha}.diff`;
  }

  return undefined;
}

export function deactivate() {}

// class DiffProvider implements vscode.TextDocumentContentProvider {
//   async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
//     return `diff --git a/CHANGELOG.md b/CHANGELOG.md
// index 846cdb7..797e2b5 100644
// --- a/CHANGELOG.md
// +++ b/CHANGELOG.md
// @@ -4,7 +4,7 @@ Update dependencies and fix encoding issue

//  # 1.1.14

// -Codebase improvements
// +Codebase improvements staged

//  # 1.1.13

// diff --git a/README.md b/README.md
// index 6e95877..d324668 100644
// --- a/README.md
// +++ b/README.md
// @@ -10,7 +10,7 @@ A simple wrapper for [diff2html](https://github.com/rtfpessoa/diff2html) library

//  **Note**: The file extension must be \`.diff\` or \`.patch\` to be properly loaded by VS Code.

// -## Demo
// +## Demo sdlfkj

//  ### Without the extension:
// `;
//   }
// }
