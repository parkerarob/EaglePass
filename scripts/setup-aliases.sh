#!/bin/bash

# EaglePass Task Manager Aliases Setup
# Run this script to add convenient aliases to your shell

SHELL_RC=""

# Detect shell and set appropriate RC file
if [[ $SHELL == *"zsh"* ]]; then
    SHELL_RC="$HOME/.zshrc"
elif [[ $SHELL == *"bash"* ]]; then
    SHELL_RC="$HOME/.bashrc"
else
    echo "Unsupported shell. Please manually add aliases to your shell configuration."
    exit 1
fi

echo "Setting up EaglePass task manager aliases..."

# Check if aliases already exist
if grep -q "# EaglePass Task Manager Aliases" "$SHELL_RC" 2>/dev/null; then
    echo "Aliases already exist in $SHELL_RC"
    exit 0
fi

# Add aliases to shell RC file
cat >> "$SHELL_RC" << 'ALIASES'

# EaglePass Task Manager Aliases
alias tm='./scripts/task-manager.sh'
alias tm-status='./scripts/task-manager.sh status'
alias tm-next='./scripts/task-manager.sh next'
alias tm-list='./scripts/task-manager.sh list'
alias tm-pending='./scripts/task-manager.sh list-pending'
alias tm-high='./scripts/task-manager.sh list-high'

# Quick task operations
tm-show() { ./scripts/task-manager.sh show "$1"; }
tm-start() { ./scripts/task-manager.sh start "$1"; }
tm-complete() { ./scripts/task-manager.sh complete "$1"; }
tm-block() { ./scripts/task-manager.sh block "$1"; }
tm-deps() { ./scripts/task-manager.sh dependencies "$1"; }

ALIASES

echo "✅ Aliases added to $SHELL_RC"
echo ""
echo "Reload your shell or run: source $SHELL_RC"
echo ""
echo "Available aliases:"
echo "  tm              - Main task manager command"
echo "  tm-status       - Show project status"
echo "  tm-next         - Find next task"
echo "  tm-list         - List all tasks"
echo "  tm-pending      - List pending tasks"
echo "  tm-high         - List high priority tasks"
echo "  tm-show <id>    - Show task details"
echo "  tm-start <id>   - Start task"
echo "  tm-complete <id> - Complete task"
echo "  tm-block <id>   - Block task"
echo "  tm-deps <id>    - Show task dependencies"
