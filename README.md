# Whole Diff VSCode Extension

This extension makes it possible to view the whole diff for working tree changes, staged changes, or a specific commit (in GitLens commits list).

## Features

The extension adds an icon to the "Staged Changes" and "Changes" groups which will open a diff that shows all the changes in a single diff file.

![Whole Diff buttons](images/buttons-screenshot.png)

The same icon is also added to GitLens Commits list, where it opens the diff for the commit.

![Whole Diff buttons on commits](images/buttons-commit-screenshot.png)

With an extension like `Diff Viewer`, the diff looks like this:

![A whole diff opened](images/diff-view-screenshot.png)

There are also two new commands in the command pallette:

1. Show whole diff of staged changes
2. Show whole diff of working tree

You can add keyboard shortcuts to your liking for these commands.

## Requirements

This extension works best together with an extension that shows a diff file graphically; I use [Diff Viewer by Guilherme Caponetto](https://marketplace.visualstudio.com/items?itemName=caponetto.vscode-diff-viewer).

## Extension Settings

Currently, there are no settings.

Let me know if you want any settings; for example to hide the buttons in a context menu.

## Known Issues

The diffs don't automatically refresh when there are git changes; you have to run the command or click the button again.

## Release Notes

See [CHANGELOG.md](CHANGELOG.md)
