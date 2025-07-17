#!/bin/bash

echo "🎵 EchoContext Factory Installation Script"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "commands" ]; then
    echo "❌ Error: Please run this script from the EchoContext-Factory directory"
    echo "💡 Usage: cd EchoContext-Factory && bash install.sh"
    exit 1
fi

# Create backup of existing .claude directory
if [ -d "$HOME/.claude" ]; then
    echo "📁 Backing up existing .claude directory..."
    cp -r "$HOME/.claude" "$HOME/.claude.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ Backup created at ~/.claude.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Create .claude directory if it doesn't exist
mkdir -p "$HOME/.claude"

# Copy all files
echo "📋 Copying EchoContext Factory files..."
cp -r ./commands "$HOME/.claude/"
cp -r ./config "$HOME/.claude/"
cp -r ./data "$HOME/.claude/"
cp -r ./hooks "$HOME/.claude/"
cp -r ./lib "$HOME/.claude/"
cp -r ./templates "$HOME/.claude/"
cp -r ./scripts "$HOME/.claude/"

# Copy configuration files
cp ./.env.sample "$HOME/.claude/"
cp ./settings.json "$HOME/.claude/"

# Make scripts executable
echo "⚙️ Setting permissions..."
chmod +x "$HOME/.claude/hooks"/*.py
chmod +x "$HOME/.claude/scripts"/*

# Create .env file if it doesn't exist
if [ ! -f "$HOME/.claude/.env" ]; then
    echo "🔑 Creating .env file..."
    cp "$HOME/.claude/.env.sample" "$HOME/.claude/.env"
    echo "✅ Created .env file from sample"
    echo "💡 Don't forget to add your API keys!"
fi

echo ""
echo "🎉 Installation Complete!"
echo "======================="
echo ""
echo "📝 Next Steps:"
echo "1. Edit ~/.claude/.env and add your API keys"
echo "2. Test voice system: /voice-status"
echo "3. Start your first project: /start-project"
echo ""
echo "🎵 EchoContext Factory is ready to use!"
echo "✨ Enjoy voice-enabled context engineering!"