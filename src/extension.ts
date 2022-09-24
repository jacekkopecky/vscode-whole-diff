import * as vscode from "vscode";
import { DiffType } from "./types";
import { WholeDiffFS } from "./whole-diff-fs";

export const FS_SCHEME = "whole-diff-fs";

export function activate(context: vscode.ExtensionContext) {
  new WholeDiffExtension(context);
}

// gleaned from runtime
interface CommandContext {
  id?: "index" | "workingTree" | "untracked";
  commit?: {
    sha?: string;
  };
}

class WholeDiffExtension {
  private diffFs = new WholeDiffFS();

  constructor(context: vscode.ExtensionContext) {
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "whole-diff.showWholeDiff",
        this.showWholeDiff
      ),
      vscode.commands.registerCommand(
        "whole-diff.showWholeDiffStaged",
        this.showWholeDiffStaged
      ),
      vscode.commands.registerCommand(
        "whole-diff.showWholeDiffWorking",
        this.showWholeDiffWorking
      )
    );

    context.subscriptions.push(
      vscode.workspace.registerFileSystemProvider(FS_SCHEME, this.diffFs, {
        isCaseSensitive: true,
        isReadonly: true,
      })
    );
  }

  showWholeDiffStaged = () => {
    this.showWholeDiff({ id: "index" });
  };

  showWholeDiffWorking = () => {
    this.showWholeDiff({ id: "workingTree" });
  };

  showWholeDiff = async (context: CommandContext) => {
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
      const uri = vscode.Uri.parse(FS_SCHEME + ":/" + type);
      await vscode.commands.executeCommand(
        "vscode.openWith",
        uri,
        "diffViewer"
      );
      this.diffFs.fireChangeEvent(uri);
    } catch (e) {
      console.warn("error opening whole diff", e);
      vscode.window.showErrorMessage("could not open whole diff");
    }
  };
}

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
