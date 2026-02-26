import os
import re

target_dir = r'\\wsl.localhost\Ubuntu\home\tjdot\RapidPro-Marketing'
new_favicon_tags = """
    <!-- Favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">
    <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="manifest" href="/site.webmanifest">
"""

def update_favicons():
    for root, dirs, files in os.walk(target_dir):
        # Skip certain directories
        if any(skip in root for skip in ['rpm-next', 'node_modules', '.git', 'dashboard']):
            continue
            
        for file in files:
            if file.endswith('.html'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Check if we already applied the 512x512 tag
                    if 'sizes="512x512" href="/android-chrome-512x512.png"' in content:
                        print(f"Skipping {file}, already has high-res favicons.")
                        continue

                    # Remove existing favicon-related tags
                    content = re.sub(r'^[ \t]*<!-- Favicon -->\n?', '', content, flags=re.MULTILINE)
                    content = re.sub(r'^[ \t]*<link rel="(shortcut )?icon"[^\n]+\n?', '', content, flags=re.MULTILINE)
                    content = re.sub(r'^[ \t]*<link rel="apple-touch-icon"[^\n]+\n?', '', content, flags=re.MULTILINE)
                    content = re.sub(r'^[ \t]*<link rel="manifest"[^\n]+\n?', '', content, flags=re.MULTILINE)
                    
                    # Inject just before </head>
                    if '</head>' in content:
                        new_content = content.replace('</head>', new_favicon_tags + '</head>')
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Updated {file}")
                    else:
                        print(f"Could not find </head> in {file}")
                except Exception as e:
                    print(f"Error processing {file}: {e}")

if __name__ == '__main__':
    update_favicons()
