import os
import re

target_dir = r'\\wsl.localhost\Ubuntu\home\tjdot\RapidPro-Marketing'
new_favicon_tags = """
    <!-- Favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="manifest" href="/site.webmanifest">
"""

def update_favicons():
    for root, dirs, files in os.walk(target_dir):
        if 'rpm-next' in root or 'node_modules' in root or '.git' in root or 'dashboard' in root:
            continue
        for file in files:
            if file.endswith('.html'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Check if we already applied the EXACT new favicon tags
                if 'sizes="180x180" href="/apple-touch-icon.png"' in content and 'href="/site.webmanifest"' in content:
                    print(f"Skipping {file}, already has new favicons.")
                    continue

                # Remove existing favicon-related tags to avoid duplicates
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

if __name__ == '__main__':
    update_favicons()
