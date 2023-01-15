import * as vscode from 'vscode';
import { WholeDiffProvider } from './whole-diff-provider';
import * as types from './types';

export const FS_SCHEME = 'whole-diff-fs';

class WholeDiffExtension {
  private diffProvider: WholeDiffProvider;

  constructor(_diffProvider: WholeDiffProvider) { this.diffProvider = _diffProvider; }

  showWholeDiffStaged = () => {
    return this.showWholeDiff({ id: 'index' });
  };

  showWholeDiffWorking = () => {
    return this.showWholeDiff({ id: 'workingTree' });
  };

  showWholeDiff = async (context: types.CommandContext) => {
    const diffPath = getDiffPath(context);
    if (!diffPath) {
      await vscode.window.showErrorMessage(
        'Whole Diff is unclear on what to diff, where did you click it?',
      );
      return;
    }

    // open the diff as a document
    try {
      const uri = vscode.Uri.from({ scheme: FS_SCHEME, path: diffPath });
      await vscode.commands.executeCommand(
        'vscode.openWith',
        uri,
        'diffViewer',
      );
      this.diffProvider.fireChangeEvent(uri);
    } catch (e) {
      console.warn('error opening whole diff', e);
      await vscode.window.showErrorMessage('could not open whole diff');
    }
  };

  refreshWholeDiff = (uri: unknown) => {
    if (!(uri instanceof vscode.Uri)) {
      console.error('requested refresh but context not a URI');
      return;
    }

    if (uri.scheme !== FS_SCHEME) {
      console.error('requested refresh but on a non-whole-diff URI');
      return;
    }

    this.diffProvider.fireChangeEvent(uri);
  };

  toggleIgnoreWhitespace = async (uri: unknown, value: boolean) => {
    await vscode.workspace.getConfiguration('diffEditor').update('ignoreTrimWhitespace', value, true);

    if (uri instanceof vscode.Uri && uri.scheme === FS_SCHEME) {
      this.diffProvider.fireChangeEvent(uri);
    }
  };

  showWhitespace = (uri: unknown) => this.toggleIgnoreWhitespace(uri, false);
  ignoreWhitespace = (uri: unknown) => this.toggleIgnoreWhitespace(uri, true);
}

function getDiffPath(context: types.CommandContext): string | undefined {
  const type = getDiffType(context);
  if (!type) return;

  const repo = getDiffRepoPath(context);
  if (!repo) return;

  return vscode.Uri.joinPath(repo, type).path;
}

function getDiffRepoPath(context: types.CommandContext): vscode.Uri | undefined {
  if (types.isGitLensCommitBase(context)) {
    if (context.repoPath) {
      return vscode.Uri.from({ ...context.uri, path: context.repoPath });
    } else {
      return context.uri;
    }
  }

  if (types.isVSCodeGit(context)) {
    const resourceUri = context.resourceStates?.[0]?.resourceUri;
    const workspaceUri = resourceUri
      ? vscode.workspace.getWorkspaceFolder(resourceUri)
      : vscode.workspace.workspaceFolders?.[0];
    return workspaceUri?.uri;
  }

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  vscode.window.showErrorMessage('Whole Diff cannot find a workspace folder');
}

function getDiffType(context: types.CommandContext): string | undefined {
  if (types.isVSCodeGit(context)) {
    if (context.id === 'workingTree') {
      return types.WORKING_TREE_DIFF;
    }

    if (context.id === 'index') {
      return types.STAGED_CHANGES_DIFF;
    }
  }

  if (types.isGitLensStash(context)) {
    return types.STASH_DIFF_PREFIX + context.commit.sha + types.DIFF_POSTFIX;
  }

  if (types.isGitLensCommit(context)) {
    return types.SHA_DIFF_PREFIX + context.commit.sha + types.DIFF_POSTFIX;
  }

  if (types.isGitLensBranch(context)) {
    return 'HEAD...' + encodeURIComponent(context.branch.name) + types.DIFF_POSTFIX;
  }

  if (types.isGitLensCompare(context)) {
    return encodeURIComponent(context.behind.ref1) +
           '..' +
           encodeURIComponent(context.behind.ref2) +
           types.DIFF_POSTFIX;
  }

  if (types.isGitLensCompareDirection(context)) {
    return encodeURIComponent(context.ref1) +
           '...' +
           encodeURIComponent(context.ref2) +
           types.DIFF_POSTFIX;
  }

  return undefined;
}

export function activate(context: vscode.ExtensionContext): void {
  const diffProvider = new WholeDiffProvider();
  const ext = new WholeDiffExtension(diffProvider);

  context.subscriptions.push(
    vscode.commands.registerCommand('whole-diff.showWholeDiff', ext.showWholeDiff),
    vscode.commands.registerCommand('whole-diff.showWholeDiffStaged', ext.showWholeDiffStaged),
    vscode.commands.registerCommand('whole-diff.showWholeDiffWorking', ext.showWholeDiffWorking),
    vscode.commands.registerCommand('whole-diff.refreshWholeDiff', ext.refreshWholeDiff),
    vscode.commands.registerCommand('whole-diff.ignoreWhitespace', ext.ignoreWhitespace),
    vscode.commands.registerCommand('whole-diff.showWhitespace', ext.showWhitespace),
  );

  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(FS_SCHEME, diffProvider),
  );
}
