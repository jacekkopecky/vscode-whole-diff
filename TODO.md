# todo:

- [x] eslint, portsoc eslint config
- [x] readme detailed description
- [x] remove the button from Untracked changes
- [x] svg after gitlens; light and dark
- [x] change git.ts into something like module
- [x] why does diffviewer not remember viewed state?
- [x] fire file events every time I press the button
- [x] add commands for staged and working tree diffs
- [x] figure out how to make reload with open diffs work
- [x] read and follow ux guidelines
- [x] change icon to codicon book?
- [x] publish!
- [x] change waiting for git from endless loop to loop that finishes, move that
      to a function
- [x] fix to work reliably with non-git files open
- [x] add the button to stashes, too
- [x] show untracked files in stash diffs
- [x] fix diffviewer's line clicking
- [x] ignore whitespace with diffEditor.ignoreTrimWhitespace setting
- [x] try adding the button to GitLens commit compare
- [x] try adding the button to GitLens branches
- [x] try adding the button to GitLens file history
- [x] try adding the button to mhutchie's Git Graph extension, maybe just at the
      top of the window, if I can find out what commit is currently selected
      there...
- [ ] try adding the button on Paused at commit... in gitlens commits when
      rebasing
- [x] adopt the same ignore-whitespace button as normal diffs have?
- [x] add refresh button
- [ ] refresh on setting change? (may not be worth it, got a branch)
- [ ] autorefresh on scm changes?
- [ ] any github issues
- [ ] maybe add tests?
- [ ] if vscode adds workspace.registerFileSearchProvider or
      workspace.registerTextSearchProvider, register one so diffs don't get
      searched
- [ ] add keybinding cmd/ctrl-r to refresh
- [ ] add refresh + ignore/show whitespace commands to command palette, when in
      the right window?
- [ ] add a way to open whole diff for a specific commit by sha (prefilled from clipboard)

## todos that need changes in diffviewer or in diff2html

- [x] make diffviewer show something sensible instead of error "no diff
      structure..."
- [x] make diffviewer have a reset button for the files viewed line, or view all
      button that views/unviews all
- [x] add inline/side-by-side toggle button?
  - icon possibilities: mirror / open-preview / split-horizontal
- [x] shorten (or make configurable somehow) diffviewer loading delay in
      provider.ts / updateWebview
- [ ] make diffviewer honour both zoom settings I use? (vscode doesn't make that
      easy)
- [ ] can whole diff have some kind of "show commit information" bit? diffviewer
      may not be able to show any kind of comments, maybe it could add that; or
      there could be a button to go use git lens or something to say something
      about the commit...
- [ ] in a diff of two similar files in two directories, where the diff looks
      like the file has moved, with the diff based (and present) in a
      subdirectory of the workspace directory, going to file links doesn't seem
      to work
- [ ] it looks like "stable both-edges" misplaces the line numbers on windows
