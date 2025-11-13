#!/bin/bash

# EduChem Website Installation Script
# This script copies files to the target directory with proper permissions

SOURCE_DIR="/tmp/educhem-site"
TARGET_DIR="/opt/lampp/htdocs/educhem-with-ajibola"

echo "=========================================="
echo "EduChem with Ajibola - Installation"
echo "=========================================="
echo ""

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "Error: Source directory not found: $SOURCE_DIR"
    exit 1
fi

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo "This script requires root privileges."
    echo "Please run with: sudo ./install.sh"
    exit 1
fi

# Create target directory if it doesn't exist
if [ ! -d "$TARGET_DIR" ]; then
    echo "Creating target directory: $TARGET_DIR"
    mkdir -p "$TARGET_DIR"
fi

# Copy files
echo "Copying files to $TARGET_DIR..."
cp -r "$SOURCE_DIR"/* "$TARGET_DIR/"

# Set permissions
echo "Setting permissions..."
chown -R www-data:www-data "$TARGET_DIR"
chmod -R 755 "$TARGET_DIR"

echo ""
echo "=========================================="
echo "Installation Complete!"
echo "=========================================="
echo ""
echo "Files have been copied to: $TARGET_DIR"
echo "Website should be accessible at: http://localhost/educhem-with-ajibola/"
echo ""
echo "Next steps:"
echo "1. Add real images to assets/images/ folder"
echo "2. Upload actual resource files (PDFs, etc.)"
echo "3. Configure backend for form submissions"
echo "4. Test all pages and links"
echo ""

