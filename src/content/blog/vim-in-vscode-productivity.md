---
title: "Vim in VS Code: The Setup That Doubled My Editing Speed"
description: "A practical guide to using the VSCodeVim extension inside VS Code — modal editing, leader keys, custom keybindings, and the exact settings.json and keybindings.json I use every day."
date: "August 2026"
pubDate: "2026-08-10"
readTime: "12 min read"
tags: ["Vim", "VS Code", "Productivity"]
headerGradient: "linear-gradient(135deg, #1a1b26 0%, #7aa2f7 100%)"
accentColor: "#7aa2f7"
calloutBg: "#e6ecff"
---


# Vim in VS Code

*How I kept the polished IDE I love and still got my hands off the mouse.*

For years I lived in two camps.

One camp had **Vim** — fast, modal, keyboard-only editing that felt like the text was moving at the speed of thought.

The other camp had **VS Code** — a real IDE with IntelliSense, a debugger, an extension for everything, and a file tree that actually made sense.

The problem was I kept having to choose.

Then I stopped choosing.

This is my setup for running **Vim inside VS Code** using the [VSCodeVim](https://marketplace.visualstudio.com/items?itemName=vscodevim.vim) extension — the settings, the keybindings, and the reasoning behind each one. You get modal editing *and* the full IDE. No compromise.

---

## The idea in one sentence

**VSCodeVim gives you Vim's modal editing on top of VS Code's editor, and you customize it entirely through `settings.json` and `keybindings.json`.**

Instead of:

```text
Reach for the mouse
   ↓
Click to position cursor
Drag to select
Right-click → menu
Click again
```

you get:

```text
Never leave home row
   ↓
Modes + motions + operators
Compose commands like sentences
```

Once the muscle memory sets in, editing stops being a series of clicks and becomes a small language you speak.

---

## Step 0: Install the extension

Open the Extensions panel (`Ctrl+Shift+X`), search for **Vim** by **vscodevim**, and install it.

The moment it activates, your editor drops into **Normal mode**. If you press keys and nothing types, that's not a bug — that's Vim. Press `i` to enter Insert mode and you're back to normal typing.

Everything after this is configuration.

---

## Where the config lives

There are two files that matter, and it's worth knowing the difference:

| File | What it controls |
|------|------------------|
| `settings.json` | VS Code settings **and** all VSCodeVim behavior (`vim.*` keys) |
| `keybindings.json` | VS Code's own keyboard shortcuts, independent of Vim |

To open them:

- `Ctrl+Shift+P` → **Preferences: Open User Settings (JSON)**
- `Ctrl+Shift+P` → **Preferences: Open Keyboard Shortcuts (JSON)**

Let me walk through my actual configuration.

---

## Part 1 — The editor foundation

Before the Vim bits, a few editor settings make everything else click into place.

```jsonc
{
    "editor.fontFamily": "'Operator Mono Lig', 'Droid Sans Mono', 'monospace', monospace",
    "editor.fontSize": 18,
    "editor.fontLigatures": true,
    "editor.formatOnSave": true,
    "editor.lineNumbers": "relative",
    "workbench.colorTheme": "Tokyo Night"
}
```

The one that matters most for Vim users:

> **`"editor.lineNumbers": "relative"`**

Relative line numbers show how far each line is *from your cursor*, not its absolute position. That's exactly what Vim motions want. When you want to delete the next 5 lines, you don't count from line 142 to line 147 — you just see a `5` next to the target and type `d5j` (or `5dd`). The numbers do the arithmetic for you.

`fontLigatures` plus a ligature-aware font like Operator Mono turns `!=`, `=>`, and `->` into single clean glyphs. Pure aesthetics, but you're going to stare at this all day.

---

## Part 2 — Turning on the good Vim features

VSCodeVim ships with several powerful features **off** by default. These are the ones I always enable:

```jsonc
{
    "vim.easymotion": true,
    "vim.smartRelativeLine": true,
    "vim.incsearch": true,
    "vim.useSystemClipboard": true,
    "vim.useCtrlKeys": true,
    "vim.hlsearch": true,
    "vim.leader": "<space>"
}
```

Here's what each one buys you:

- **`easymotion`** — press `<leader><leader>` followed by a motion and every jump target gets a letter label. Type the letter, teleport there. It's the fastest way to move across a screen without counting anything.
- **`smartRelativeLine`** — relative numbers while in Normal mode, but absolute numbers in Insert mode. Best of both worlds.
- **`incsearch`** — incremental search that jumps as you type, like modern editors.
- **`useSystemClipboard`** — yank (`y`) copies to your OS clipboard and `p` pastes from it. This one erases the friction between Vim's registers and the rest of your machine.
- **`useCtrlKeys`** — lets Vim handle `Ctrl`-based shortcuts (`Ctrl+V` visual-block, etc.) instead of VS Code swallowing them.
- **`hlsearch`** — highlights all search matches.
- **`leader`** — sets the **leader key** to `Space`. The leader is a prefix you press before your own custom shortcuts. Space is huge, central, and hit by either thumb — the best real estate on the keyboard.

> **The leader key is the heart of a personal Vim setup.** Almost every custom command below starts with `<Space>`.

---

## Part 3 — Escape without reaching

The single best quality-of-life remap in my config:

```jsonc
{
    "vim.insertModeKeyBindings": [
        {
            "before": ["k", "j"],
            "after": ["<Esc>"]
        }
    ]
}
```

This maps `kj` (typed quickly, in Insert mode) to `Escape`.

The `Esc` key is in the far corner of the keyboard, and in Vim you press it *constantly* to leave Insert mode. Remapping it to a fast `kj` roll keeps your hands on home row. You'll almost never type the literal letters `k` then `j` together in real prose, so false triggers are rare.

Some people use `jk` or `jj`. Pick one and commit — the muscle memory forms in a day.

---

## Part 4 — Normal-mode superpowers

This is where the config really earns its keep. All of these live under `vim.normalModeKeyBindingsNonRecursive`. "NonRecursive" just means the remaps won't trigger *other* remaps — safer and more predictable.

### Buffer (tab) switching

```jsonc
{ "before": ["<S-h>"], "commands": [":bprevious"] },
{ "before": ["<S-l>"], "commands": [":bnext"] }
```

`Shift+H` and `Shift+L` move to the previous/next open file. `H` and `L` already mean "left" and "right" in Vim's mental model, so shifting them to mean "the file to the left/right" is intuitive muscle memory.

### Splits

```jsonc
{ "before": ["leader", "v"], "commands": [":vsplit"] },
{ "before": ["leader", "s"], "commands": [":split"] }
```

`<Space>v` splits the editor **v**ertically, `<Space>s` **s**plits horizontally.

### Moving between panes

```jsonc
{ "before": ["leader", "h"], "commands": ["workbench.action.focusLeftGroup"] },
{ "before": ["leader", "j"], "commands": ["workbench.action.focusBelowGroup"] },
{ "before": ["leader", "k"], "commands": ["workbench.action.focusAboveGroup"] },
{ "before": ["leader", "l"], "commands": ["workbench.action.focusRightGroup"] }
```

`<Space>` + `h/j/k/l` moves focus between editor groups using the same directional keys you already use to move the cursor. Once this is wired in, jumping across a split screen feels identical to moving the cursor one character — same fingers, bigger distance.

### The file tree

```jsonc
{ "before": ["leader", "n", "e"], "commands": ["workbench.explorer.fileView.focus"] }
```

`<Space>ne` focuses the file explorer without touching the mouse. (Think "**n**avigate **e**xplorer" — or a nod to NERDTree if you're coming from terminal Vim.)

### Everyday niceties

```jsonc
{ "before": ["leader", "w"], "commands": [":w!"] },
{ "before": ["leader", "q"], "commands": [":q!"] },
{ "before": ["leader", "x"], "commands": [":x!"] },
{ "before": ["leader", "f", "f"], "commands": ["workbench.action.quickOpen"] },
{ "before": ["leader", "f", "m"], "commands": ["editor.action.formatDocument"] },
{ "before": ["leader", "g", "h"], "commands": ["editor.action.showDefinitionPreviewHover"] }
```

- `<Space>w` — **w**rite (save)
- `<Space>q` — **q**uit
- `<Space>x` — save **and** close
- `<Space>ff` — **f**ind **f**ile (the fuzzy Quick Open, `Ctrl+P` by another name)
- `<Space>fm` — **f**or**m**at the document
- `<Space>gh` — **g**o to **h**over: peek a symbol's definition inline

The pattern here is deliberate: group related commands under a shared prefix (`f` for "find/format") so the bindings read almost like words. This is how you keep dozens of shortcuts memorable.

### A few more

```jsonc
{ "before": ["<leader>", "d"], "after": ["d", "d"] },
{ "before": ["<C-n>"], "commands": [":nohl"] }
```

- `<Space>d` deletes the current line (a shorthand for `dd`).
- `Ctrl+N` clears search highlights — handy after `hlsearch` lights up the whole file.

> **A note on collisions:** it's easy to bind the same leader key twice by accident. An earlier draft of this config mapped `<Space>k` to *both* "focus the pane above" and "preview a definition." VSCodeVim resolves duplicates by taking the **last** one in the list, so the pane-focus silently stopped working. That's why the definition preview above lives on `<Space>gh` instead — it keeps the `<Space>h/j/k/l` pane-navigation set intact. Keep an eye on your leader map as it grows: the second I add a binding, I skim for an existing owner of that key.

---

## Part 5 — Letting VS Code keep some shortcuts

Vim wants to own every keystroke, but some `Ctrl` combos are too useful to hand over. `vim.handleKeys` lets VS Code keep them:

```jsonc
{
    "vim.handleKeys": {
        "<C-s>": false,
        "<C-w>": false,
        "<C-z>": false,
        "<C-y>": false,
        "<C-f>": false
    }
}
```

Setting a key to `false` means **"Vim, don't touch this — let VS Code handle it."** So:

- `Ctrl+S` still saves
- `Ctrl+W` still closes tabs / manages windows
- `Ctrl+Z` still undoes at the OS level
- `Ctrl+Y`, `Ctrl+F` stay as VS Code defaults

This is the pragmatic middle ground: Vim for editing, VS Code for the shortcuts your fingers already know from every other app.

---

## Part 6 — Performance

One tweak that quietly matters:

```jsonc
{
    "extensions.experimental.affinity": {
        "vscodevim.vim": 1
    }
}
```

This runs VSCodeVim in its **own extension host process**. Because Vim intercepts every keystroke, isolating it on its own thread noticeably reduces input latency. If you've ever felt Vim-in-VS-Code lag behind your typing, this is the fix.

---

## Part 7 — The `keybindings.json` layer

`settings.json` handled Vim. Now `keybindings.json` handles the parts of VS Code *around* the editor — the terminal, the file tree, panels. These aren't Vim, but they complete the keyboard-only workflow.

### Tab and outdent inside the editor

```jsonc
{
    "key": "tab",
    "command": "tab",
    "when": "editorTextFocus && !editorTabMovesFocus"
},
{
    "key": "shift+tab",
    "command": "outdent",
    "when": "editorTextFocus && !editorTabMovesFocus"
}
```

These keep `Tab` / `Shift+Tab` indenting and outdenting normally even with Vim active.

### Terminal navigation

```jsonc
{ "key": "ctrl+shift+a", "command": "workbench.action.terminal.focusNext", "when": "terminalFocus" },
{ "key": "ctrl+shift+b", "command": "workbench.action.terminal.focusPrevious", "when": "terminalFocus" },
{ "key": "ctrl+shift+j", "command": "workbench.action.togglePanel" },
{ "key": "ctrl+shift+n", "command": "workbench.action.terminal.new", "when": "terminalFocus" },
{ "key": "ctrl+shift+w", "command": "workbench.action.terminal.kill", "when": "terminalFocus" },
{ "key": "ctrl+shift+m", "command": "workbench.action.toggleMaximizedPanel", "when": "terminalFocus" }
```

This gives the terminal a tmux-like feel: cycle between terminals, spawn and kill them, toggle the panel, and maximize it — all from the keyboard. The `when` clauses scope each binding so it only fires where it should.

### File tree operations

This is where it gets genuinely powerful. The `filesExplorerFocus && !inputFocus` condition means these single-letter keys only fire when the **file tree** is focused and you're **not** typing in a text box:

```jsonc
{ "key": "ctrl+e", "command": "workbench.action.toggleSidebarVisibility" },
{ "key": "space+e", "command": "workbench.files.action.focusFilesExplorer", "when": "editorTextFocus" },
{ "key": "a", "command": "explorer.newFile",   "when": "filesExplorerFocus && !inputFocus" },
{ "key": "r", "command": "renameFile",         "when": "filesExplorerFocus && !inputFocus" },
{ "key": "d", "command": "deleteFile",         "when": "filesExplorerFocus && !inputFocus" }
```

So in the file tree:
- `a` — create a new file
- `r` — rename
- `d` — delete
- `Ctrl+E` — toggle the sidebar
- `Space+E` — jump from the editor into the tree

If you've used the NERDTree or `nvim-tree` plugins in terminal Vim, this recreates that exact feel: navigate files with `j`/`k`, act on them with single letters. No mouse, no right-click menus.

### Context-aware `Shift+N`

```jsonc
{ "key": "shift+n", "command": "explorer.newFolder", "when": "explorerViewletFocus" },
{ "key": "shift+n", "command": "workbench.action.newWindow", "when": "!explorerViewletFocus" }
```

A neat trick: the same key does two different things depending on context. In the explorer, `Shift+N` makes a new **folder**. Everywhere else, it opens a new **window**. The `when` clause is what makes one key serve two purposes — this is the single most underused feature in VS Code keybindings.

---

## The complete `settings.json`

Here's the full Vim-relevant configuration in one block, ready to drop in:

```jsonc
{
    "editor.fontFamily": "'Operator Mono Lig', 'Droid Sans Mono', 'monospace', monospace",
    "editor.fontSize": 18,
    "editor.formatOnSave": true,
    "editor.lineNumbers": "relative",
    "editor.fontLigatures": true,
    "workbench.colorTheme": "Tokyo Night",

    // Vim
    "vim.easymotion": true,
    "vim.smartRelativeLine": true,
    "vim.incsearch": true,
    "vim.useSystemClipboard": true,
    "vim.useCtrlKeys": true,
    "vim.hlsearch": true,
    "vim.leader": "<space>",
    "vim.insertModeKeyBindings": [
        { "before": ["k", "j"], "after": ["<Esc>"] }
    ],
    "vim.normalModeKeyBindingsNonRecursive": [
        { "before": ["<S-h>"], "commands": [":bprevious"] },
        { "before": ["<S-l>"], "commands": [":bnext"] },
        { "before": ["leader", "v"], "commands": [":vsplit"] },
        { "before": ["leader", "s"], "commands": [":split"] },
        { "before": ["leader", "h"], "commands": ["workbench.action.focusLeftGroup"] },
        { "before": ["leader", "j"], "commands": ["workbench.action.focusBelowGroup"] },
        { "before": ["leader", "k"], "commands": ["workbench.action.focusAboveGroup"] },
        { "before": ["leader", "l"], "commands": ["workbench.action.focusRightGroup"] },
        { "before": ["leader", "n", "e"], "commands": ["workbench.explorer.fileView.focus"] },
        { "before": ["leader", "w"], "commands": [":w!"] },
        { "before": ["leader", "q"], "commands": [":q!"] },
        { "before": ["leader", "x"], "commands": [":x!"] },
        { "before": ["leader", "f", "f"], "commands": ["workbench.action.quickOpen"] },
        { "before": ["leader", "f", "m"], "commands": ["editor.action.formatDocument"] },
        { "before": ["leader", "g", "h"], "commands": ["editor.action.showDefinitionPreviewHover"] },
        { "before": ["<leader>", "d"], "after": ["d", "d"] },
        { "before": ["<C-n>"], "commands": [":nohl"] }
    ],
    "vim.handleKeys": {
        "<C-s>": false,
        "<C-w>": false,
        "<C-z>": false,
        "<C-y>": false,
        "<C-f>": false
    },
    "extensions.experimental.affinity": {
        "vscodevim.vim": 1
    }
}
```

---

## The complete `keybindings.json`

And here's the matching `keybindings.json` — the VS Code shortcuts that surround the editor (terminal, file tree, panels), ready to drop in:

```jsonc
// Place your key bindings in this file to override the defaults
[
    {
        "key": "tab",
        "command": "tab",
        "when": "editorTextFocus && !editorTabMovesFocus"
    },
    {
        "key": "shift+tab",
        "command": "outdent",
        "when": "editorTextFocus && !editorTabMovesFocus"
    },

    // NAVIGATION
    { "key": "ctrl+shift+a", "command": "workbench.action.terminal.focusNext",     "when": "terminalFocus" },
    { "key": "ctrl+shift+b", "command": "workbench.action.terminal.focusPrevious", "when": "terminalFocus" },
    { "key": "ctrl+shift+j", "command": "workbench.action.togglePanel" },
    { "key": "ctrl+shift+n", "command": "workbench.action.terminal.new",           "when": "terminalFocus" },
    { "key": "ctrl+shift+w", "command": "workbench.action.terminal.kill",          "when": "terminalFocus" },
    { "key": "ctrl+shift+m", "command": "workbench.action.toggleMaximizedPanel",   "when": "terminalFocus" },

    // FILE TREE
    { "key": "ctrl+e", "command": "workbench.action.toggleSidebarVisibility" },
    { "key": "space+e", "command": "workbench.files.action.focusFilesExplorer", "when": "editorTextFocus" },
    { "key": "a", "command": "explorer.newFile",   "when": "filesExplorerFocus && !inputFocus" },
    { "key": "r", "command": "renameFile",         "when": "filesExplorerFocus && !inputFocus" },
    { "key": "d", "command": "deleteFile",         "when": "filesExplorerFocus && !inputFocus" },
    { "key": "shift+n", "command": "explorer.newFolder",          "when": "explorerViewletFocus" },
    { "key": "shift+n", "command": "workbench.action.newWindow",  "when": "!explorerViewletFocus" }
]
```

> One thing worth repeating: the single-letter file-tree bindings (`a`, `r`, `d`) are only safe because of the `filesExplorerFocus && !inputFocus` guard. Without it, pressing `d` while typing would try to delete a file. The `when` clause is what makes single letters usable outside the editor.

---

## Bonus: reuse your real `.vimrc`

If you already have a battle-tested `.vimrc`, VSCodeVim can source it directly:

```jsonc
{
    "vim.vimrc.enable": true,
    "vim.vimrc.path": "~/.vimrc"
}
```

I keep this commented out in my own config — I prefer defining everything in `settings.json` so it syncs cleanly across machines via Settings Sync. But if your muscle memory is tied to an existing `.vimrc`, this is the fastest way to bring it over.

---

## A quick sanity check

After pasting all this in, restart VS Code and try this sequence to confirm it's alive:

1. Open a file. You should start in **Normal mode** (cursor is a block).
2. Press `i`, type a few words, then roll `kj` — you should snap back to Normal mode.
3. Press `<Space>ff` — Quick Open should appear.
4. Press `<Space>v` — the editor should split.
5. Press `<Space>l` then `<Space>h` — focus should hop between the two splits.
6. Press `<Space>ne` — the file tree should take focus. Press `a` to make a new file.

If all six work, your setup is complete.

---

## Why this actually makes you faster

It's tempting to think this is about looking like a hacker. It isn't.

The real gains are boring and compounding:

- **Your hands never leave home row.** The average developer moves to the mouse thousands of times a day. Each trip is a tiny context switch. Remove them and the day feels calmer.
- **Editing composes.** `ci"` changes text inside quotes. `d5j` deletes five lines down. `>ap` indents a paragraph. You stop thinking in clicks and start thinking in *verbs and objects*.
- **The leader map becomes a personal language.** `<Space>ff`, `<Space>w`, `<Space>fm` — after a week these aren't shortcuts you recall, they're reflexes.
- **You keep the whole IDE.** Debugger, IntelliSense, Git integration, extensions — none of it goes away. You just drive it differently.

---

## Closing thought

The first three days with Vim in VS Code are frustrating. You'll press `j` and watch your cursor wander when you meant to type text. That's normal — it's the tax you pay once.

Push through it. By the end of the first week the modes disappear from conscious thought, and you're left with something that feels less like operating an editor and more like the text bending to your intent.

Start with the config above. Delete the bindings you don't use. Add the ones you wish existed.

That's the whole point — it becomes *yours*.

Happy editing. `<Space>w` `<Space>q` 🚀
