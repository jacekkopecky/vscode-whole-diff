/*
 * these types are for the parameter of the command hanlder function, gleaned from runtime
 */

import * as vscode from 'vscode';

interface VSCodeGitContext {
  id: 'index' | 'workingTree',
  resourceStates?: Array<{ resourceUri: vscode.Uri }>,
}

export function isVSCodeGit(arg: CommandContext): arg is VSCodeGitContext {
  const context = <Partial<VSCodeGitContext>>arg;
  return Boolean(context.id);
}

interface GitLensContextBase {
  uri: vscode.Uri,
}

interface GitLensCommitContext extends GitLensContextBase {
  commit: {
    sha: string,
  },
}

interface GitLensBranchContext extends GitLensContextBase {
  branch: {
    name: string,
  },
}

interface GitLensTwoRefs {
  ref1: string,
  ref2: string,
}

interface GitLensCompareContext extends GitLensContextBase {
  ahead: GitLensTwoRefs,
  behind: GitLensTwoRefs,
}

interface GitLensCompareDirectionContext extends GitLensContextBase, GitLensTwoRefs {
}

export function isGitLensCommitBase(arg: CommandContext): arg is GitLensContextBase {
  const context = <Partial<GitLensContextBase>>arg;
  return Boolean(context.uri);
}

function isGitLensTwoRefs(arg?: Partial<GitLensTwoRefs>): arg is GitLensTwoRefs {
  return Boolean(arg?.ref1 && arg?.ref2);
}

export function isGitLensCommit(arg: CommandContext): arg is GitLensCommitContext {
  const context = <Partial<GitLensCommitContext>>arg;
  return Boolean(isGitLensCommitBase(arg) && context.commit?.sha);
}

export function isGitLensBranch(arg: CommandContext): arg is GitLensBranchContext {
  const context = <Partial<GitLensBranchContext>>arg;
  return Boolean(isGitLensCommitBase(arg) && context.branch?.name);
}

export function isGitLensCompare(arg: CommandContext): arg is GitLensCompareContext {
  const context = <Partial<GitLensCompareContext>>arg;
  return Boolean(isGitLensCommitBase(arg) && isGitLensTwoRefs(context.ahead) && isGitLensTwoRefs(context.behind));
}

export function isGitLensCompareDirection(arg: CommandContext): arg is GitLensCompareDirectionContext {
  const context = <Partial<GitLensCompareDirectionContext>>arg;
  return Boolean(isGitLensCommitBase(arg) && isGitLensTwoRefs(context));
}

type GitLensContext =
  GitLensCommitContext |
  GitLensBranchContext |
  GitLensCompareContext |
  GitLensCompareDirectionContext;

export type CommandContext = VSCodeGitContext | GitLensContext | unknown;
