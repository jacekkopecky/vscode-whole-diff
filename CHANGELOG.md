# Change Log

All notable changes to the "whole-diff" extension will be documented in this
file.

## [0.7.0] - 2024-07-14

- improve support for git repositories in sub-folder of a workspace folder

## [0.6.0] - 2023-05-29

- add a command "Show whole diff for a given SHA" with id
  whole-diff.showWholeDiffBySha
  - the command lets you input the SHA
  - if there is a SHA in the clipboard, it will be the default value
- add a command whole-diff.showWholeDiffByShaImmediate like the above
  - but if there is a SHA in the clipboard, it opens the diff immediately
    without asking for a SHA
- add the whole diff icon to Git Graph extension windows
- 0.6.1 fixes behaviour on GitLens comparisons with working tree
- 0.6.2 makes the tab button commands available in the command pallette and for
  keyboard shortcuts
  - this applies to `whole-diff.refreshWholeDiff`, `whole-diff.showWhitespace`
    and `whole-diff.ignoreWhitespace`

## [0.5.0] - 2023-01-14

- simplify code from FileSystemProvider to TextDocumentContentProvider (should
  work the same)
- add a refresh button to the whole diff windows
- 0.5.1-3 add ignore whitespace toggle button

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
