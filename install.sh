#!/bin/bash

echo "🎵 EchoContext Factory Installation Script v2.5.0"
echo "=================================================="
echo "🚀 Voice-enabled context engineering with live search only"
echo ""

# Detect platform
PLATFORM="unknown"
case "$(uname -s)" in
    Linux*)     PLATFORM="linux";;
    Darwin*)    PLATFORM="macos";;
    CYGWIN*)    PLATFORM="windows";;
    MINGW*)     PLATFORM="windows";;
    MSYS*)      PLATFORM="windows";;
esac

echo "🖥️  Detected platform: $PLATFORM"
echo ""

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "commands" ]; then
    echo "❌ Error: Please run this script from the EchoContext-Factory directory"
    echo "💡 Usage: cd EchoContext-Factory && bash install.sh"
    exit 1
fi

# Determine home directory path
if [ "$PLATFORM" = "windows" ]; then
    CLAUDE_DIR="${USERPROFILE}/.claude"
else
    CLAUDE_DIR="$HOME/.claude"
fi

echo "📁 Installing to: $CLAUDE_DIR"

# Create backup of existing .claude directory
if [ -d "$CLAUDE_DIR" ]; then
    echo "📁 Backing up existing .claude directory..."
    cp -r "$CLAUDE_DIR" "${CLAUDE_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ Backup created at ${CLAUDE_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Create .claude directory if it doesn't exist
mkdir -p "$CLAUDE_DIR"

# Copy all files
echo "📋 Copying EchoContext Factory files..."
for dir in commands config data hooks lib templates; do
    if [ -d "./$dir" ]; then
        cp -r "./$dir" "$CLAUDE_DIR/" || {
            echo "❌ Error: Failed to copy $dir directory"
            exit 1
        }
        echo "✅ Copied $dir"
    else
        echo "⚠️  Warning: $dir directory not found, skipping"
    fi
done

# Create scripts directory and copy contents if they exist
mkdir -p "$CLAUDE_DIR/scripts"
if [ -d "./scripts" ]; then
    # Only copy if directory has contents
    if [ "$(ls -A ./scripts 2>/dev/null)" ]; then
        cp -r ./scripts/* "$CLAUDE_DIR/scripts/"
    fi
fi

# Copy configuration files
echo "📋 Copying configuration files..."
for file in .env.sample settings.json CLAUDE.md; do
    if [ -f "./$file" ]; then
        cp "./$file" "$CLAUDE_DIR/" || {
            echo "❌ Error: Failed to copy $file"
            exit 1
        }
        echo "✅ Copied $file"
    else
        echo "❌ Error: Required file $file not found"
        exit 1
    fi
done

# Copy fallback settings for systems without uv
if [ -f "./settings.fallback.json" ]; then
    cp "./settings.fallback.json" "$CLAUDE_DIR/"
    echo "✅ Copied settings.fallback.json (for systems without uv)"
fi

# Make scripts executable (skip on Windows)
if [ "$PLATFORM" != "windows" ]; then
    echo "⚙️ Setting permissions..."
    chmod +x "$CLAUDE_DIR/hooks"/*.py
    if [ -d "$CLAUDE_DIR/scripts" ] && [ "$(ls -A $CLAUDE_DIR/scripts)" ]; then
        chmod +x "$CLAUDE_DIR/scripts"/*
    fi
fi

# Create .env file if it doesn't exist
if [ ! -f "$CLAUDE_DIR/.env" ]; then
    echo "🔑 Creating .env file..."
    cp "$CLAUDE_DIR/.env.sample" "$CLAUDE_DIR/.env"
    echo "✅ Created .env file from sample"
    echo "💡 Don't forget to add your API keys!"
fi

echo ""
echo "🎉 Installation Complete!"
echo "======================="
echo ""
echo "📝 Next Steps:"
if [ "$PLATFORM" = "windows" ]; then
    echo "1. Edit $CLAUDE_DIR/.env and add your API keys"
else
    echo "1. Edit ~/.claude/.env and add your API keys"
fi
echo "2. Test voice system: /voice-status"
echo "3. Start your first project: /start-project"
echo "4. Try multi-agent coordination: /multiagent"
echo ""
echo "🎵 EchoContext Factory v2.5.0 is ready to use!"
echo "✨ Enjoy voice-enabled context engineering with live search!"
echo "🔍 All commands now use live data only - no mock fallbacks"
echo ""
echo "Platform-specific notes:"
case "$PLATFORM" in
    "linux")
        echo "• Linux: All features fully supported"
        echo "• Voice: Install espeak for better TTS fallback: sudo apt-get install espeak"
        echo "• Python hooks: Install uv for best performance: curl -LsSf https://astral.sh/uv/install.sh | sh"
        echo "• Alternative: If uv not available, replace settings.json with settings.fallback.json"
        ;;
    "macos")
        echo "• macOS: All features fully supported"
        echo "• Voice: Built-in 'say' command provides excellent TTS fallback"
        echo "• Python hooks: uv recommended for best performance: curl -LsSf https://astral.sh/uv/install.sh | sh"
        ;;
    "windows")
        echo "• Windows: Core features supported"
        echo "• Voice: pyttsx3 provides TTS fallback"
        echo "• Note: Some Python hooks may require Windows Subsystem for Linux (WSL)"
        echo "• Python hooks: Install uv via pip: pip install uv"
        ;;
esac