/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *-------------------------------------------------------------------------------------------- */
// copied and cut down from
// https://github.com/microsoft/vscode-extension-samples/blob/main/fsprovider-sample/src/fileSystemProvider.ts

import * as vscode from 'vscode';
import * as path from 'path';

import * as types from './types';

let git: types.Git | undefined;

class File implements vscode.FileStat {
  private static _size = 0;

  type: vscode.FileType;
  ctime: number;
  mtime: number;
  size: number;

  constructor() {
    this.type = vscode.FileType.File;
    this.ctime = 0;
    this.mtime = Date.now();
    this.size = File._size++;
  }
}

export class WholeDiffFS implements vscode.FileSystemProvider {
  // --- manage file metadata

  stat(): vscode.FileStat {
    // no specific stats, pretend file created and changed now
    return new File();
  }

  readDirectory(): [string, vscode.FileType][] {
    // no listing of files
    return [];
  }

  // --- manage file contents

  async readFile(uri: vscode.Uri): Promise<Uint8Array> {
    return strToA(await generateDiff(uri));
  }

  writeFile(): void {
    throw vscode.FileSystemError.NoPermissions('read-only file system');
  }

  // --- manage files/folders

  rename(): void {
    throw vscode.FileSystemError.NoPermissions('read-only file system');
  }

  delete(): void {
    throw vscode.FileSystemError.NoPermissions('read-only file system');
  }

  createDirectory(): void {
    throw vscode.FileSystemError.NoPermissions('read-only file system');
  }

  // events, we fire an event every time the user requests a diff
  private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();

  readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> =
    this._emitter.event;

  watch(): vscode.Disposable {
    // ignore, changes are fired on all files
    return new vscode.Disposable(() => { /* ignore */ });
  }

  public fireChangeEvent(uri: vscode.Uri): void {
    this._emitter.fire([{ type: vscode.FileChangeType.Changed, uri }]);
  }
}

function strToA(str: string): Uint8Array {
  const buf = Buffer.from(str, 'utf-8');
  return new Uint8Array(buf);
}

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

  const baseDiff = ['diff'];
  if (vscode.workspace.getConfiguration('diffEditor').get('ignoreTrimWhitespace') === true) {
    baseDiff.push('-b');
  }

  if (diffType === types.STAGED_CHANGES_DIFF) {
    return [...baseDiff, '--cached'];
  }

  if (diffType === types.WORKING_TREE_DIFF) {
    return [...baseDiff];
  }

  const sha = diffType.match(types.SHA_REGEX)?.[1];
  if (sha) {
    return [...baseDiff, `${sha}~1..${sha}`];
  }

  const twoRefs = diffType.match(types.TWO_REF_REGEX)?.[1];
  if (twoRefs) {
    return [...baseDiff, decodeURIComponent(twoRefs)];
  }

  throw vscode.FileSystemError.FileNotFound(`Cannot find diff for ${diffType}`);
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
