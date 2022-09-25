/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *-------------------------------------------------------------------------------------------- */
// copied and cut down from
// https://github.com/microsoft/vscode-extension-samples/blob/main/fsprovider-sample/src/fileSystemProvider.ts

import * as vscode from 'vscode';
import * as path from 'path';

import { DiffType, GitExtension, Git } from './types';

let git: Git | undefined;

class File implements vscode.FileStat {
  type: vscode.FileType;
  ctime: number;
  mtime: number;
  size: number;

  data?: Uint8Array;

  constructor() {
    this.type = vscode.FileType.File;
    this.ctime = Date.now();
    this.mtime = Date.now();
    this.size = 0;
  }
}

const GENERIC_STAT = new File();

export class WholeDiffFS implements vscode.FileSystemProvider {
  // --- manage file metadata

  stat(): vscode.FileStat {
    // no specific stats
    return GENERIC_STAT;
  }

  readDirectory(): [string, vscode.FileType][] {
    // no listing of files
    return [];
  }

  // --- manage file contents

  async readFile(uri: vscode.Uri): Promise<Uint8Array> {
    // todo put the git stuff here
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
    // ignore, no changes
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
  const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

  if (!cwd) {
    await vscode.window.showErrorMessage('Whole Diff cannot find a workspace folder');
    throw vscode.FileSystemError.Unavailable('Whole Diff cannot find cwd');
  }

  // check if vscode.git is available and if not, wait a bit
  let gitExt: vscode.Extension<GitExtension> | undefined;
  for (let i = 0; i < 20; i += 1) {
    gitExt = vscode.extensions.all.find((ex) => ex.id === 'vscode.git');
    if (gitExt?.isActive) {
      break;
    }
    console.log('waiting for git to activate');
    await delay(500);
  }

  if (!git) {
    git = gitExt?.exports.model.git;
    if (!git) {
      await vscode.window.showErrorMessage('Whole Diff cannot find git');
      throw vscode.FileSystemError.Unavailable('Whole Diff cannot find git');
    }
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

  if (diffType === <DiffType>'staged changes.diff') {
    return ['diff', '--cached'];
  }

  if (diffType === <DiffType>'working tree.diff') {
    return ['diff'];
  }

  const sha = diffType.match(/sha-([0-9a-fA-F]*)\.diff/)?.[1];
  if (sha) {
    return ['diff', `${sha}~1..${sha}`];
  }

  throw vscode.FileSystemError.FileNotFound(`Cannot find diff for ${diffType}`);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
