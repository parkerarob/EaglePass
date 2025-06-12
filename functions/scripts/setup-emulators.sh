#!/bin/bash
set -e

# TODO: Re-enable this script once Google Cloud Storage outage is resolved
# See docs/KNOWN_ISSUES.md for details on the emulator JAR download issue

# Constants
JAR_VERSION="v1.19.8"
JAR_NAME="cloud-firestore-emulator-${JAR_VERSION}.jar"
CACHE_DIR="$HOME/.cache/firebase/emulators"
TARGET_JAR="$CACHE_DIR/$JAR_NAME"
EXPECTED_SIZE=67000000  # ~67MB

# Create cache directory if it doesn't exist
mkdir -p "$CACHE_DIR"

# Function to get file size in a portable way
get_file_size() {
    file="$1"
    if [ "$(uname)" = "Darwin" ]; then
        stat -f%z "$file"
    else
        stat -c%s "$file"
    fi
}

# Function to verify JAR integrity
verify_jar() {
    jar_path="$1"
    # Check if file exists
    if [ ! -f "$jar_path" ]; then
        echo "Error: JAR file not found at $jar_path"
        return 1
    fi
    # Check file size
    size=$(get_file_size "$jar_path")
    if [ "$size" -lt "$EXPECTED_SIZE" ]; then
        echo "Error: JAR file is too small (${size} bytes). Expected at least ${EXPECTED_SIZE} bytes."
        return 1
    fi
    # Verify it's a valid JAR
    if ! jar tf "$jar_path" > /dev/null 2>&1; then
        echo "Error: File is not a valid JAR"
        return 1
    fi
    echo "JAR verification successful!"
    return 0
}

# Check if we already have a valid JAR
if verify_jar "$TARGET_JAR"; then
    echo "Valid Firestore emulator JAR already exists at $TARGET_JAR"
    exit 0
fi

# Try to download from multiple sources
echo "Attempting to download Firestore emulator..."

# List of potential download URLs
URLS=(
    "https://storage.googleapis.com/firebase-preview-drop/emulator/$JAR_NAME"
    "https://storage.googleapis.com/downloads.firebase.tools/emulators/$JAR_NAME"
    "https://github.com/firebase/firebase-tools/releases/download/v12.9.1/$JAR_NAME"
)

# Try each URL until one works
for url in "${URLS[@]}"; do
    echo "Trying: $url"
    if curl -L -o "$TARGET_JAR" "$url"; then
        if verify_jar "$TARGET_JAR"; then
            echo "Successfully downloaded and verified Firestore emulator"
            exit 0
        fi
        echo "Download completed but verification failed, trying next source..."
    fi
done

echo "Error: Failed to download a valid Firestore emulator JAR"
echo "Please try one of these manual solutions:"
echo "1. Download the JAR manually from a working region (e.g., using a VPN to eu-west or ap-southeast)"
echo "2. Use the Google Cloud CLI's bundled emulator: gcloud emulators firestore start"
echo "3. Pin to an older Firebase CLI version: npm i -g firebase-tools@13.7.5"
exit 1 