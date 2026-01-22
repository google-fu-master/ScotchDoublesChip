#!/bin/bash

# Quick markdown linting fix script
# This script fixes the most common markdown linting issues

echo "🔧 Fixing common Markdown linting issues..."

# Files to fix
FILES=(
    "scripts/README.md"
    "tests/README.md"
    "shared/README.md"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "📝 Fixing $file..."
        
        # Create a backup
        cp "$file" "$file.backup"
        
        # Fix common issues using sed
        # Add blank line before ### headings that don't have them
        sed -i '/^[^#].*[^[:space:]]$/N; s/\(^[^#].*[^[:space:]]\)\n\(### \*\*.*\*\*\)$/\1\n\n\2/' "$file"
        
        # Add blank line after ### headings before lists
        sed -i '/^### \*\*.*\*\*$/N; s/\(^### \*\*.*\*\*\)\n\(- .*\)$/\1\n\n\2/' "$file"
        
        # Add blank lines around fenced code blocks
        sed -i '/^```/i\\n' "$file"
        sed -i '/^```$/a\\n' "$file"
        
        # Remove extra blank lines (more than 2 consecutive)
        sed -i '/^$/N;/^\n$/d' "$file"
        
        echo "✅ Fixed $file"
    else
        echo "⚠️  File $file not found"
    fi
done

echo "🎉 Markdown linting fixes applied!"
echo "💡 Note: Some manual fixes may still be needed for complex formatting issues."