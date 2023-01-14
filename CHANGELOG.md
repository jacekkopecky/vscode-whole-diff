# Change Log

All notable changes to the "whole-diff" extension will be documented in this
file.

## [0.5.0] - 2023-01-14

- simplify code from FileSystemProvider to TextDocumentContentProvider (should
  work the same)
- add a refresh button to the whole diff windows
- 0.5.1-2 add ignore whitespace toggle button

## [0.4.0] - 2022-10-25

- add whole diff on GitLens branches and comparisons
- 0.4.1, 0.4.3 fix handling of branches with / in the name (such as
  `bug-fix/slashes`)
- 0.4.4-7 fix manual refresh on windows (sorry about the slew of versions)
- 0.4.8 add whole diff on GitLens file history
- 0.4.9 show stashed untracked files in stash diff

## [0.3.0] - 2022-10-25

- fix refresh behaviour when reopening a diff
- use `diffEditor.ignoreTrimWhitespace` setting to ignore whitespace changes

## [0.2.0] - 2022-09-26

- fix bug where the extension wouldn't reliably find the git repository
- 0.2.1 is an attempt to fix it on Windows
- 0.2.2 adds the button on GitLens stashes, too
- 0.2.3 fixes #2: opening diff through command palette

## [0.1.0] - 2022-09-25

- Initial release
- 0.1.1 removes todo list from readme
- 0.1.2 adds the changelog
