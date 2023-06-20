export const WORKING_TREE_DIFF = 'working tree.diff';
export const STAGED_CHANGES_DIFF = 'staged changes.diff';
export const SHA_DIFF_PREFIX = 'sha-';
export const STASH_DIFF_PREFIX = 'stash-';
export const DIFF_POSTFIX = '.diff';
export const SHA_REGEX = /^[0-9a-fA-F]+$/;
export const SHA_DIFF_REGEX = /sha-([0-9a-fA-F]*)\.diff/;
export const STASH_REGEX = /stash-([0-9a-fA-F]*)\.diff/;
export const TWO_REF_REGEX = /([^.]+\.\.\.?[^.]+)\.diff/;

// working tree (WT) comparisons
export const WT_TO_REF_REGEX = /^\.\.\.([^.]+)\.diff/;
export const WT_AND_REF_REGEX = /^\.\.([^.]+)\.diff/;
export const REF_TO_WT_REGEX = /^([^.]+)\.\.\.\.diff/;

export * from './types-command-context';
export * from './types-vscode-git';
