---
title: "Python Virtual Environments & UV: The Complete Guide"
description: "A deep dive into Python virtual environments — professional dependency management."
date: "May 2026"
pubDate: "2026-05-15"
readTime: "16 min read"
tags: ["Python", "Virtual Environment", "UV"]
headerGradient: "linear-gradient(135deg, #11472d 0%, #2d8653 100%)"
accentColor: "#2d6a4f"
calloutBg: "#e8f5ee"
---

Picture this: you're working on two Python projects simultaneously. Project A needs `Django 4.2`. Project B needs `Django 3.2` because it was built years ago and upgrading it would break everything. If you install both globally — they overwrite each other. Only one survives.

This is **dependency hell**, and virtual environments are the solution.

## The Problem: Global Python Is Shared

When you install a package globally with `pip install requests`, it lands in your system's `site-packages` directory — shared by every Python script on your machine.

```bash
# where do global packages live?
python -m site --user-site
# → /home/you/.local/lib/python3.12/site-packages
```

The moment two projects need different versions of the same library, a global install breaks one of them. Virtual environments solve this by giving **each project its own isolated site-packages**.

---

## What a Virtual Environment Actually Is

A venv is not magic. It's just a **directory** containing:
- A Python binary (or a symlink to one)
- An isolated `site-packages` folder
- Activation scripts that temporarily redirect `PATH`

That's it. When you activate a venv, your shell starts finding `python` and `pip` inside that directory instead of the global ones. When you deactivate, everything goes back to normal — no package was ever touched globally.

---

## Creating a Virtual Environment

```bash
python -m venv .venv
```

Breaking this down:
- `python` — the specific Python version you want in the environment. Use `python3.11` or `python3.12` to be explicit.
- `-m venv` — runs the built-in `venv` module
- `.venv` — the directory name. `.venv` (dot prefix) is the modern convention — it stays hidden in file explorers and signals "tooling directory, not source code"

<div class="callout">
<strong>Naming convention:</strong> The Python Packaging Authority (PyPA) recommends <code>.venv</code>. Most editors (VS Code, PyCharm) auto-detect it. Avoid committing it — add it to <code>.gitignore</code>.
</div>

---

## The Directory Structure, Explained

```
.venv/
├── pyvenv.cfg            ← environment metadata
├── bin/                  ← Linux/macOS
│   ├── python            ← symlink to your system Python
│   ├── python3           ← same symlink
│   ├── pip               ← pip scoped to this env
│   ├── activate          ← bash/zsh activation script
│   ├── activate.fish     ← fish shell
│   └── activate.ps1      ← PowerShell (Windows)
├── Scripts/              ← Windows (instead of bin/)
│   ├── python.exe
│   ├── pip.exe
│   └── Activate.ps1
└── lib/
    └── python3.12/
        └── site-packages/   ← YOUR packages land here
            ├── requests/
            ├── pip/
            └── setuptools/
```

### `pyvenv.cfg` — The Environment's ID Card

This small file is important. Open it and you'll see:

```ini
home = /usr/bin
include-system-site-packages = false
version = 3.12.3
prompt = .venv
```

- `home` — the directory of the Python binary this env was created from
- `include-system-site-packages` — if `true`, the env can also see global packages. Usually `false`.
- `version` — the exact Python version baked in

Python reads this file to understand it's running inside a virtual environment.

---

## What Activation Actually Does

Running `source .venv/bin/activate` does three things to your current shell session:

**1. Prepends the venv's `bin/` to `PATH`:**
```bash
# Before activation:
PATH=/usr/local/bin:/usr/bin:/bin

# After activation:
PATH=/your/project/.venv/bin:/usr/local/bin:/usr/bin:/bin
```
Now `python` and `pip` resolve to the venv versions first.

**2. Sets the `VIRTUAL_ENV` environment variable:**
```bash
echo $VIRTUAL_ENV
# → /your/project/.venv
```
Tools like VS Code and tox use this to detect you're in an environment.

**3. Updates your shell prompt** to show the environment name, so you always know which env is active.

<div class="callout">
<strong>Important:</strong> Activation is shell-scoped. It only affects the current terminal session. Opening a new terminal tab? You start fresh — no active environment.
</div>

Deactivation simply undoes all three:
```bash
deactivate
```

---

## Activating by Platform

```bash
# Linux / macOS (bash or zsh)
source .venv/bin/activate

# fish shell
source .venv/bin/activate.fish

# Windows — Command Prompt
.venv\Scripts\activate.bat

# Windows — PowerShell
.venv\Scripts\Activate.ps1
```

---

## Installing and Managing Packages

Once activated, `pip` installs only into your venv:

```bash
pip install requests httpx          # install packages
pip install "django>=4.2,<5.0"     # with version constraints
pip install -e .                    # install current project in editable mode
```

### `pip freeze` vs `pip list`

These are not the same:

```bash
pip list          # human-readable table of installed packages
pip freeze        # pip-installable format: package==version
```

```bash
# pip list output:
Package    Version
---------- -------
requests   2.31.0
certifi    2024.2.2

# pip freeze output:
certifi==2024.2.2
charset-normalizer==3.3.2
idna==3.6
requests==2.31.0
urllib3==2.2.1
```

`pip freeze` captures **everything** — including transitive dependencies (packages that your packages need). Use this to capture a reproducible snapshot.

---

## Professional Dependency Management

Amateur projects use a single `requirements.txt`. Production projects split dependencies by purpose:

```
requirements/
├── base.txt        ← core runtime deps
├── dev.txt         ← development-only (testing, linting)
└── prod.txt        ← production extras (gunicorn, sentry-sdk)
```

**`requirements/base.txt`:**
```
Django>=4.2,<5.0
requests==2.31.0
celery==5.3.6
```

**`requirements/dev.txt`** — includes base:
```
-r base.txt
pytest==8.1.1
pytest-django==4.8.0
ruff==0.4.1
mypy==1.9.0
black==24.3.0
```

**`requirements/prod.txt`** — includes base:
```
-r base.txt
gunicorn==21.2.0
sentry-sdk[django]==1.44.0
```

Install for a specific environment:
```bash
pip install -r requirements/dev.txt     # for local development
pip install -r requirements/prod.txt    # for production server
```

### Pinning All Transitive Dependencies

`pip freeze > requirements.txt` captures exact versions. But managing this manually is fragile — update one package and the file goes stale. The right tool for this is `pip-compile` (from `pip-tools`):

```bash
pip install pip-tools

# Write high-level deps in requirements.in:
# Django>=4.2
# requests

pip-compile requirements.in
# → generates requirements.txt with every transitive dep pinned exactly
```

This is the **old way**. There's a better one — UV handles this natively.

---

## `pyproject.toml` — The Modern Standard

Since PEP 517/518, the Python community standardised on `pyproject.toml` as the single file for project metadata and dependencies. It replaces `setup.py`, `setup.cfg`, and the manual `requirements.txt` workflow:

```toml
[project]
name = "myapp"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "django>=4.2,<5.0",
    "requests>=2.31",
    "celery>=5.3",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "ruff>=0.4",
    "mypy>=1.9",
]
```

This is what UV uses natively, and it's where the Python ecosystem is heading.

---

## Best Practices Checklist

```
✅  Always use .venv (dot prefix, per PyPA convention)
✅  Add .venv/ to .gitignore — never commit the environment
✅  Pin exact versions in production (reproducibility)
✅  Specify requires-python in pyproject.toml
✅  Recreate venv from scratch when Python version changes
✅  Use separate envs per project — never share across projects
✅  Document the setup steps in README.md
```

**`.gitignore` entries:**
```
.venv/
venv/
env/
__pycache__/
*.pyc
*.pyo
.Python
```

---

## UV — The Modern Python Package Manager

All the above works, but it has friction. Creating a venv, activating it, installing, freezing, splitting requirements files, managing Python versions with `pyenv`... it's a lot of ceremony for what should be simple.

**UV** fixes this. It replaces `pip`, `pip-tools`, `venv`, `virtualenv`, `pyenv`, and `pipx` — all in one tool, written in Rust, and **10–100× faster** than pip.

### Why UV is Faster

- Written in **Rust** — avoids Python interpreter startup overhead for every command
- Uses a **global cache** — once a package is downloaded, any project on your machine reuses it instantly
- Resolves dependencies using a modern SAT solver — faster and more correct than pip's resolver
- Parallel downloads — fetches multiple packages simultaneously

```bash
# pip installing 20 packages:  ~45 seconds
# uv installing 20 packages:   ~0.8 seconds
```

### Installing UV

```bash
# macOS / Linux — recommended
curl -LsSf https://astral.sh/uv/install.sh | sh

# Or via pip (bootstrapping)
pip install uv

# Or via Homebrew (macOS)
brew install uv
```

Verify:
```bash
uv --version
# → uv 0.5.x
```

<div class="callout">
<strong>No Python required:</strong> UV ships as a single self-contained binary. You don't even need Python installed to install UV — it can install Python for you.
</div>

---

## UV: Managing Virtual Environments

UV is a drop-in replacement for `python -m venv`:

```bash
# Old way:
python -m venv .venv
source .venv/bin/activate

# UV way:
uv venv                  # creates .venv automatically
source .venv/bin/activate

# With a specific Python version:
uv venv --python 3.12
uv venv --python 3.11.9  # exact version
```

UV also has a pip-compatible interface — swap `pip` for `uv pip` and everything works:

```bash
uv pip install requests       # same as pip install, but fast
uv pip install -r requirements.txt
uv pip freeze                 # same output as pip freeze
uv pip list
uv pip uninstall requests
```

---

## UV: Project Management (The Real Power)

For a new project, UV gives you a full project workflow that makes `requirements.txt` management obsolete:

### Starting a New Project

```bash
uv init myapp
cd myapp
```

UV creates:
```
myapp/
├── .venv/            ← created automatically
├── uv.lock           ← exact lock file (commit this!)
├── pyproject.toml    ← your dependencies go here
├── README.md
└── hello.py
```

### Adding Dependencies

```bash
uv add requests            # adds to pyproject.toml + installs + updates uv.lock
uv add "django>=4.2"       # with version constraint
uv add --dev pytest ruff   # dev-only dependency
uv add --optional prod gunicorn   # optional group
```

Your `pyproject.toml` updates automatically:
```toml
[project]
dependencies = [
    "django>=4.2",
    "requests>=2.31.0",
]

[dependency-groups]
dev = [
    "pytest>=8.0",
    "ruff>=0.4",
]
```

### Removing Dependencies

```bash
uv remove requests
```

Removes from `pyproject.toml`, uninstalls from the venv, and updates `uv.lock`.

### Syncing the Environment

```bash
uv sync              # installs exactly what's in uv.lock
uv sync --dev        # includes dev dependencies
```

This is the command you run after cloning a project. It reads `uv.lock` and gives you **byte-for-byte identical** packages on every machine.

### The Lock File

`uv.lock` is like `package-lock.json` for Python. It pins every dependency and sub-dependency to exact versions and hashes:

```
version = 1

[[package]]
name = "requests"
version = "2.31.0"
source = { registry = "https://pypi.org/simple" }
dependencies = [
  { name = "certifi" },
  { name = "charset-normalizer" },
  ...
]
sdist = { url = "...", hash = "sha256:942c5a758f98d790eaed1a29cb6eefc7ffb0d1cf7af05c3d2791656dbd6ad1e1" }
```

<div class="callout">
<strong>Always commit <code>uv.lock</code></strong> — it's what makes your project reproducible. Another developer running <code>uv sync</code> gets the exact same packages, even 2 years later.
</div>

---

## UV: Running Scripts Without Activating

UV can run scripts directly in the project environment — no manual activation needed:

```bash
uv run python main.py       # runs with the project's venv
uv run pytest               # runs pytest in the venv
uv run -- python -c "import django; print(django.__version__)"
```

This is especially useful in CI/CD pipelines and Makefiles — no activation scripts, no shell-specific syntax.

---

## UV: Managing Python Versions

UV replaces `pyenv` for Python version management:

```bash
# List available Python versions
uv python list

# Install specific versions
uv python install 3.12
uv python install 3.11.9
uv python install pypy3.10    # yes, PyPy too!

# Pin a project to a Python version (writes to .python-version)
uv python pin 3.12

# Use a version for a one-off command
uv run --python 3.11 python --version
```

---

## `uvx` — Run Tools Without Installing

UV ships with `uvx`, equivalent to `npx` in the Node.js world. It runs CLI tools in a temporary isolated environment — no global install, no pollution:

```bash
uvx ruff check .         # run ruff without installing globally
uvx black .              # format with black
uvx pytest               # run pytest
uvx httpie GET httpbin.org/get   # HTTP client
uvx mkdocs serve         # docs server
```

The tool is downloaded, cached, and discarded — your global environment stays clean.

---

## UV vs The Old Workflow — Side by Side

| Task | Old Way | UV Way |
|---|---|---|
| Create venv | `python -m venv .venv` | `uv venv` |
| Install package | `pip install requests` | `uv add requests` |
| Install all deps | `pip install -r requirements.txt` | `uv sync` |
| Freeze deps | `pip freeze > requirements.txt` | automatic via `uv.lock` |
| Remove package | `pip uninstall requests` + edit file | `uv remove requests` |
| Install Python | `pyenv install 3.12` | `uv python install 3.12` |
| Run tool once | `pipx run ruff .` | `uvx ruff .` |
| Speed | Baseline | **10–100× faster** |

---

## The Full UV Workflow for a New Project

```bash
# 1. Create project
uv init myapp && cd myapp

# 2. Add dependencies
uv add django celery redis
uv add --dev pytest pytest-django ruff mypy

# 3. Develop — run anything without manual activation
uv run python manage.py runserver
uv run pytest
uv run ruff check .

# 4. Share with your team — they just run:
git clone <repo>
cd myapp
uv sync --dev   # exact same packages, in seconds
```

## Migrating an Existing Project to UV

If you have an existing project with a `requirements.txt`:

```bash
# Import existing requirements
uv add $(cat requirements.txt)

# Or generate pyproject.toml from requirements.txt
uv init --no-readme
uv add -r requirements.txt
```

---

## Summary

Virtual environments isolate your project's dependencies so they never conflict with other projects or the system. Under the hood, they work by redirecting `PATH` to a local `bin/` directory with its own `site-packages`.

**Classic workflow** (`venv` + `pip`):
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements/dev.txt
pip freeze > requirements.txt
```

**Modern workflow** (`uv`):
```bash
uv init myapp && cd myapp
uv add requests django
uv run python main.py
```

UV is the right choice for new projects. It's faster, handles everything in one tool, produces a proper lock file, and manages Python versions too. The old workflow still works — and knowing it deeply (as covered above) is essential for maintaining legacy codebases — but for greenfield work, start with UV.

<div class="callout">
<strong>Further reading:</strong> UV's documentation at <a href="https://docs.astral.sh/uv" target="_blank">docs.astral.sh/uv</a> is excellent and actively maintained. The <em>Concepts</em> section explains the resolver and cache in detail.
</div>
