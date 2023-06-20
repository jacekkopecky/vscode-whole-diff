/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *-------------------------------------------------------------------------------------------- */
// copied and cut down from
// https://github.com/microsoft/vscode-extension-samples/blob/main/fsprovider-sample/src/fileSystemProvider.ts

import * as vscode from 'vscode';
import * as path from 'path';

import * as types from './types';

export class WholeDiffProvider implements vscode.TextDocumentContentProvider {
  provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
    return generateDiff(uri);
  }

  // events, we fire an event every time the user requests a diff
  private _emitter = new vscode.EventEmitter<vscode.Uri>();

  readonly onDidChange: vscode.Event<vscode.Uri> =
    this._emitter.event;

  public fireChangeEvent(uri: vscode.Uri): void {
    this._emitter.fire(uri);
  }
}

let git: types.Git | undefined;

async function generateDiff(uri: vscode.Uri): Promise<string> {
  const cwd = path.dirname(uri.fsPath);

  if (!cwd) {
    await vscode.window.showErrorMessage('Whole Diff cannot find a repository folder');
    throw vscode.FileSystemError.Unavailable(`Whole Diff cannot find cwd for git for ${uri.fsPath}`);
  }

  if (!git) {
    git = await findGit();
  }

  const args = extractDiffArgs(uri);
  const result = await git.exec(cwd, args);
  if (result.exitCode !== 0) {
    console.warn(result);
    await vscode.window.showErrorMessage('Whole Diff cannot generate diff');
    throw vscode.FileSystemError.Unavailable('Whole Diff cannot generate diff');
  }

  return result.stdout;
}

function extractDiffArgs(uri: vscode.Uri): string[] {
  const diffType = path.basename(uri.path);

  const opts: string[] = [];
  if (vscode.workspace.getConfiguration('diffEditor').get('ignoreTrimWhitespace') === true) {
    opts.push('-b');
  }

  // order is important here;
  const retval =
    extractStagedDiff(diffType, opts) ??
    extractWorkingTreeDiff(diffType, opts) ??
    extractShaDiff(diffType, opts) ??
    extractStashDiff(diffType, opts) ??
    extractTwoRefsDiff(diffType, opts) ??
    extractWorkingTreeToRefDiff(diffType, opts) ??
    extractRefToWorkingTreeDiff(diffType, opts) ??
    extractWorkingTreeAndRefDiff(diffType, opts)
    ;

  if (retval) {
    return retval;
  } else {
    throw vscode.FileSystemError.FileNotFound(`Cannot find diff for ${diffType}`);
  }
}

function extractStagedDiff(diffType: string, opts: string[]) {
  if (diffType === types.STAGED_CHANGES_DIFF) {
    return ['diff', ...opts, '--cached'];
  }
}

function extractWorkingTreeDiff(diffType: string, opts: string[]) {
  if (diffType === types.WORKING_TREE_DIFF) {
    return ['diff', ...opts];
  }
}

function extractShaDiff(diffType: string, opts: string[]) {
  const match = diffType.match(types.SHA_DIFF_REGEX)?.[1];
  if (match) {
    return ['diff', ...opts, `${match}~1..${match}`];
  }
}

function extractStashDiff(diffType: string, opts: string[]) {
  const match = diffType.match(types.STASH_REGEX)?.[1];
  if (match) {
    return ['stash', 'show', '-u', '-p', ...opts, `${match}`];
  }
}

function extractTwoRefsDiff(diffType: string, opts: string[]) {
  const match = diffType.match(types.TWO_REF_REGEX)?.[1];
  if (match) {
    return ['diff', ...opts, decodeURIComponent(match)];
  }
}

function extractWorkingTreeToRefDiff(diffType: string, opts: string[]) {
  const match = diffType.match(types.WT_TO_REF_REGEX)?.[1];
  if (match) {
    console.log('wt to ref');
    return ['diff', ...opts, '-R', decodeURIComponent(match)];
  }
}

function extractRefToWorkingTreeDiff(diffType: string, opts: string[]) {
  const match = diffType.match(types.REF_TO_WT_REGEX)?.[1];
  if (match) {
    console.log('ref to wt');
    return ['diff', ...opts, decodeURIComponent(match)];
  }
}

function extractWorkingTreeAndRefDiff(diffType: string, opts: string[]) {
  const match = diffType.match(types.WT_AND_REF_REGEX)?.[1];
  if (match) {
    console.log('wt and ref todo');
    // same as above
    return ['diff', ...opts, decodeURIComponent(match)];
  }
}


async function findGit(): Promise<types.Git> {
  if (git) return git;

  // check if vscode.git is available and if not, wait a bit
  let gitExt: vscode.Extension<types.GitExtension> | undefined;
  for (let i = 0; i < 20; i += 1) {
    gitExt = vscode.extensions.all.find((ex) => ex.id === 'vscode.git');
    if (gitExt?.isActive) {
      break;
    }
    console.log('waiting for git to activate');
    await delay(500);
  }

  git = gitExt?.exports.model.git;
  if (!git) {
    await vscode.window.showErrorMessage('Whole Diff cannot find git');
    throw vscode.FileSystemError.Unavailable('Whole Diff cannot find git');
  }

  return git;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
