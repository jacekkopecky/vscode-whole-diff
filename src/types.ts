import * as cp from 'child_process';

export type DiffType =
  | 'working tree.diff'
  | 'staged changes.diff'
  | `sha-${string}.diff`;

/*
 * the types below are extracted from vscode's git extension, 1.71
 */

export interface SpawnOptions extends cp.SpawnOptions {
  input?: string,
  encoding?: string,
  log?: boolean,
  cancellationToken?: unknown,
  onSpawn?: (childProcess: cp.ChildProcess) => void,
}

export interface IExecutionResult<T extends string | Buffer> {
  exitCode: number,
  stdout: T,
  stderr: string,
}

export interface Git {
  exec(
    cwd: string,
    args: string[],
    options?: SpawnOptions
  ): Promise<IExecutionResult<string>>,
}

export interface GitExtension {
  model: {
    git: Git,
  },
}
