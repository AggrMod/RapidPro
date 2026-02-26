import os
import re

target_dir = r'\\wsl.localhost\Ubuntu\home\tjdot\RapidPro-Marketing'

def update_logo_size():
    # 1. Update index.html
    index_path = os.path.join(target_dir, 'index.html')
    if os.path.exists(index_path):
        with open(index_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Double the header height and logo container height
        content = content.replace('--header-height-desktop: 80px;', '--header-height-desktop: 160px;')
        content = content.replace('height: 70px;', 'height: 140px;') # This matches .logo-container
        
        with open(index_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated index.html logo size.")

    # 2. Update funnel.css
    funnel_css_path = os.path.join(target_dir, 'css', 'funnel.css')
    if os.path.exists(funnel_css_path):
        with open(funnel_css_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        content = content.replace('height: 50px;', 'height: 100px;') # .logo img
        # Also adjust header padding if needed, but 1rem (16px) * 2 should be fine for 100px logo.
        
        with open(funnel_css_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated funnel.css logo size.")

    # 3. Update quick-fixes.css (footer logo)
    quick_fixes_path = os.path.join(target_dir, 'css', 'quick-fixes.css')
    if os.path.exists(quick_fixes_path):
        with open(quick_fixes_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        content = content.replace('height: 60px !important;', 'height: 120px !important;')
        content = content.replace('max-width: 200px !important;', 'max-width: 400px !important;')
        
        with open(quick_fixes_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated quick-fixes.css footer logo size.")

    # 4. Update Next.js Header.tsx
    header_tsx_path = os.path.join(target_dir, 'rpm-next', 'components', 'layout', 'Header.tsx')
    if os.path.exists(header_tsx_path):
        with open(header_tsx_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Double font sizes
        content = content.replace("fontSize: '1.5rem'", "fontSize: '3rem'")
        content = content.replace("fontSize: '2rem'", "fontSize: '4rem'")
        
        with open(header_tsx_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated Header.tsx logo size.")

if __name__ == '__main__':
    update_logo_size()
