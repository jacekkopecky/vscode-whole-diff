/*
 * these types are for the parameter of the command hanlder function, gleaned from runtime
 */

import * as vscode from 'vscode';

interface VSCodeGitContext {
  id: 'index' | 'workingTree',
  resourceStates: Array<{ resourceUri: vscode.Uri }>,
}

export function isVSCodeGit(arg: CommandContext): arg is VSCodeGitContext {
  const context = <Partial<VSCodeGitContext>>arg;
  return Boolean(context.id && context.resourceStates?.[0]?.resourceUri);
}

interface GitLensCommitContext {
  commit: {
    sha: string,
  },
  uri: vscode.Uri,
}

export function isGitLensCommit(arg: CommandContext): arg is GitLensCommitContext {
  const context = <Partial<GitLensCommitContext>>arg;
  return Boolean(context.commit?.sha && context.uri);
}

export type CommandContext = VSCodeGitContext | GitLensCommitContext | unknown;
