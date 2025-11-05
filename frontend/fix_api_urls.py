#!/usr/bin/env python3
import re

files = [
    'src/views/Categories.vue',
    'src/views/AddProduct.vue'
]

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Add import if not exists
    if 'import { API_BASE_URL }' not in content:
        content = content.replace(
            "import axios from 'axios'",
            "import axios from 'axios'\nimport { API_BASE_URL } from '../config/api'"
        )
    
    # Replace all localhost:4000 URLs
    content = re.sub(
        r"'http://localhost:4000/api/",
        r"`${API_BASE_URL}/api/",
        content
    )
    content = re.sub(
        r"`http://localhost:4000/api/",
        r"`${API_BASE_URL}/api/",
        content
    )
    content = re.sub(
        r"'http://localhost:4000'",
        r"API_BASE_URL",
        content
    )
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"✓ Fixed {filepath}")

print("\n✅ All files fixed!")
