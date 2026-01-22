#!/bin/bash

# Enhanced fix script for tests/README.md complex formatting issues
echo "🔧 Fixing complex Markdown issues in tests/README.md..."

FILE="tests/README.md"

# Fix heading spacing and list formatting
sed -i '/^### \*\*.*\*\*$/{
    N
    /\n[^[:space:]]/!{
        s/$/\n/
    }
}' "$FILE"

# Add blank lines before lists
sed -i '/^- /{
    x
    /^$/!{
        x
        i\

        b
    }
    x
}' "$FILE"

# Fix empty code blocks and add language specifications
sed -i 's/^```$/```text/g' "$FILE"

# Fix blank lines around code blocks
sed -i '/^```[a-z]*$/{
    x
    /^$/!{
        x
        i\

        b
    }
    x
}' "$FILE"

# Add trailing newline if missing
if [ -n "$(tail -c1 "$FILE")" ]; then
    echo >> "$FILE"
fi

echo "✅ Enhanced fixes applied to tests/README.md"