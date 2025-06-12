#!/bin/bash

# TODO: Re-enable this script once Google Cloud Storage outage is resolved
# See docs/KNOWN_ISSUES.md for details on the emulator JAR download issue

# Constants
JAR_VERSION="v1.19.8"
JAR_NAME="cloud-firestore-emulator-${JAR_VERSION}.jar"
CACHE_DIR="$HOME/.cache/firebase/emulators"
TARGET_JAR="$CACHE_DIR/$JAR_NAME"
TEMP_DIR="/tmp/firebase-emulator"

# Create necessary directories
mkdir -p "$CACHE_DIR"
mkdir -p "$TEMP_DIR"

# Function to download JAR
download_jar() {
    echo "Attempting to download JAR from alternative source..."
    
    # Try downloading from GitHub releases (more reliable during Cloud Storage outages)
    curl -L -o "$TEMP_DIR/$JAR_NAME" \
        "https://github.com/firebase/firebase-tools/releases/download/v12.9.1/$JAR_NAME"
    
    if [ $? -eq 0 ] && [ -f "$TEMP_DIR/$JAR_NAME" ]; then
        echo "Download successful!"
        return 0
    fi
    
    echo "Download failed. Please try downloading manually using a VPN to a different region."
    return 1
}

# Check if JAR is provided as argument
if [ -z "$1" ]; then
    echo "No JAR file provided. Attempting to download..."
    if ! download_jar; then
        echo ""
        echo "Manual download instructions:"
        echo "1. Connect to a VPN in a different region (e.g., eu-west or ap-southeast)"
        echo "2. Download the JAR:"
        echo "   curl -O https://storage.googleapis.com/downloads.firebase.tools/emulators/$JAR_NAME"
        echo "3. Run this script again with the downloaded file:"
        echo "   $0 /path/to/$JAR_NAME"
        exit 1
    fi
    SOURCE_JAR="$TEMP_DIR/$JAR_NAME"
else
    SOURCE_JAR="$1"
fi

# Verify source JAR exists
if [ ! -f "$SOURCE_JAR" ]; then
    echo "Error: Source JAR not found at $SOURCE_JAR"
    exit 1
fi

# Copy the JAR
echo "Copying JAR to $TARGET_JAR..."
cp "$SOURCE_JAR" "$TARGET_JAR"

# Verify the copy
if [ ! -f "$TARGET_JAR" ]; then
    echo "Error: Failed to copy JAR to $TARGET_JAR"
    exit 1
fi

# Clean up temp directory
rm -rf "$TEMP_DIR"

echo "JAR copied successfully!"
echo "You can now run: firebase emulators:start" 