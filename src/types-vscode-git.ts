/*
 * the types below are extracted from vscode's git extension, 1.71
 */

import * as cp from 'child_process';

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
    repositories: {
      root: string,
    }[],
  },
}
