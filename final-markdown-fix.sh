#!/bin/bash

# Final comprehensive fix for all remaining markdown issues
echo "🔧 Applying final fixes for remaining markdown issues..."

# Fix DEVELOPMENT_LIFECYCLE.md issues
FILE="DEVELOPMENT_LIFECYCLE.md"

# Fix h4 heading spacing and list formatting
sed -i '/^#### \*\*.*\*\*$/{
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

# Add blank lines before numbered lists
sed -i '/^[0-9]\+\. /{
    x
    /^$/!{
        x
        i\

        b
    }
    x
}' "$FILE"

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

echo "✅ Final fixes applied to $FILE"

# Fix tests/README.md remaining issues
FILE="tests/README.md"

# Remove multiple consecutive blank lines
perl -i -pe 's/\n\n\n+/\n\n/g' "$FILE"

# Add trailing newline if missing
if [ -n "$(tail -c1 "$FILE")" ]; then
    echo >> "$FILE"
fi

echo "✅ Final fixes applied to $FILE"

echo "🎉 All markdown linting issues should now be resolved!"