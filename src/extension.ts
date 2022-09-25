import * as vscode from 'vscode';
import { DiffType } from './types';
import { WholeDiffFS } from './whole-diff-fs';

export const FS_SCHEME = 'whole-diff-fs';

// gleaned from runtime
interface CommandContext {
  id?: 'index' | 'workingTree' | 'untracked',
  commit?: {
    sha?: string,
  },
}

class WholeDiffExtension {
  private diffFs: WholeDiffFS;

  constructor(_diffFs: WholeDiffFS) { this.diffFs = _diffFs; }

  showWholeDiffStaged = () => {
    return this.showWholeDiff({ id: 'index' });
  };

  showWholeDiffWorking = () => {
    return this.showWholeDiff({ id: 'workingTree' });
  };

  showWholeDiff = async (context: CommandContext) => {
    const type = getDiffType(context);
    if (!type) {
      await vscode.window.showErrorMessage(
        'Whole Diff is unclear on what to diff, where did you click it?',
      );
      console.warn(
        "whole diff doesn't know what to diff from this context",
        context,
      );
      return;
    }

    // open the patch as a document
    try {
      const uri = vscode.Uri.parse(FS_SCHEME + ':/' + type);
      await vscode.commands.executeCommand(
        'vscode.openWith',
        uri,
        'diffViewer',
      );
      this.diffFs.fireChangeEvent(uri);
    } catch (e) {
      console.warn('error opening whole diff', e);
      await vscode.window.showErrorMessage('could not open whole diff');
    }
  };
}

function getDiffType(context: CommandContext): DiffType | undefined {
  // todo remove the button from untracked changes; or else, what should I do when clicked on untracked?

  if (context.id === 'workingTree') {
    return 'working tree.diff';
  }

  if (context.id === 'index') {
    return 'staged changes.diff';
  }

  if (context.commit?.sha) {
    return `sha-${context.commit?.sha}.diff`;
  }

  return undefined;
}

export function activate(context: vscode.ExtensionContext): void {
  const diffFs = new WholeDiffFS();
  const ext = new WholeDiffExtension(diffFs);

  context.subscriptions.push(
    vscode.commands.registerCommand('whole-diff.showWholeDiff', ext.showWholeDiff),
    vscode.commands.registerCommand(
      'whole-diff.showWholeDiffStaged',
      ext.showWholeDiffStaged,
    ),
    vscode.commands.registerCommand(
      'whole-diff.showWholeDiffWorking',
      ext.showWholeDiffWorking,
    ),
  );

  context.subscriptions.push(
    vscode.workspace.registerFileSystemProvider(FS_SCHEME, diffFs, {
      isCaseSensitive: true,
      isReadonly: true,
    }),
  );
}
