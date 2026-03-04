<<<<<<< Updated upstream
import os
import re
import subprocess
from bs4 import BeautifulSoup

template_path = r'C:\Users\tjdot\RapidPro\template.html'
target_dir = r'C:\Users\tjdot\RapidPro'

with open(template_path, 'r', encoding='utf-8') as f:
    template_content = f.read()

def get_original_content(filename):
    """Retrieve content of the file from the commit before the first migration."""
    try:
        # Looking for the first commit before the one that created template.html
        # or just use the version that doesn't have the template marker.
        cmd = ["git", "show", f"1e09dbe^:{filename}"] # Commit before any template-related changes
        result = subprocess.run(cmd, cwd=target_dir, capture_output=True, text=True, encoding='utf-8')
        if result.returncode == 0:
            return result.stdout
    except Exception:
        pass
    
    # If git fails, just read current file but we might lose meta if it's already a template
    with open(os.path.join(target_dir, filename), 'r', encoding='utf-8') as f:
        return f.read()

def apply_template(filename):
    filepath = os.path.join(target_dir, filename)
    if not os.path.exists(filepath):
        print(f"File {filename} not found.")
        return

    content_to_parse = get_original_content(filename)
    soup = BeautifulSoup(content_to_parse, 'html.parser')

    # Extract info
    title = soup.title.string if soup.title else "Rapid Pro Maintenance"
    
    canonical = ""
    canonical_tag = soup.find('link', rel='canonical')
    if canonical_tag:
        canonical = canonical_tag.get('href', "")
    if not canonical:
        canonical = f"https://rapidpromemphis.com/{filename}"
    
    description = ""
    desc_tag = soup.find('meta', attrs={'name': 'description'})
    if desc_tag:
        description = desc_tag.get('content', "")
        
    keywords = ""
    kw_tag = soup.find('meta', attrs={'name': 'keywords'})
    if kw_tag:
        keywords = kw_tag.get('content', "")

    # Extract schema scripts
    schema_scripts = []
    for script in soup.find_all('script', type='application/ld+json'):
        schema_scripts.append(str(script))
    
    # Extract custom styles
    custom_styles = []
    for style in soup.find_all('style'):
        content = style.string if style.string else ""
        # Skip the styles we know are in the template
        if "--header-height-desktop" not in content and "/* .hero */" not in content:
            custom_styles.append(str(style))

    # Identify main content
    body = soup.body
    if not body:
        print(f"No body found in {filename}")
        return

    # Find the real main content
    # Remove header, nav, footer, scripts from the body to isolate content
    for tag in body.find_all(['header', 'nav', 'footer', 'script', 'style']):
        tag.decompose()
    
    # If there's a <main> tag, take its content
    main_tag = body.find('main')
    if main_tag:
        main_content = "".join([str(c) for c in main_tag.contents]).strip()
    else:
        main_content = "".join([str(c) for c in body.contents]).strip()

    # Final cleanup: wrap in a single <main> if needed, or just let it be
    # We want it to be <main>SECTION CONTENT</main> in the final file.
    # The template has <main><!-- PAGE_CONTENT --></main>
    # So we just provide the inner content.

    # Replace placeholders in template
    new_content = template_content
    new_content = new_content.replace('<!-- PAGE_TITLE -->', title)
    new_content = new_content.replace('<!-- CANONICAL_URL -->', canonical)
    new_content = new_content.replace('<!-- META_DESCRIPTION -->', description)
    new_content = new_content.replace('<!-- META_KEYWORDS -->', keywords)
    new_content = new_content.replace('<!-- OG_TITLE -->', title)
    new_content = new_content.replace('<!-- OG_DESCRIPTION -->', description)
    new_content = new_content.replace('<!-- EXTRA_STYLES -->', "\n".join(custom_styles))
    new_content = new_content.replace('<!-- EXTRA_SCRIPTS -->', "\n".join(schema_scripts))
    new_content = new_content.replace('<!-- PAGE_CONTENT -->', main_content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Optimized template applied to {filename}")

if __name__ == '__main__':
    files_to_update = [
        'germantown-kitchen-equipment-repair.html',
        'bartlett-commercial-appliance-repair.html',
        'collierville-restaurant-equipment-service.html',
        'memphis-commercial-oven-repair.html',
        'memphis-ice-machine-service.html',
        'memphis-commercial-refrigeration-services.html',
        'memphis-commercial-fryer-repair.html',
        'memphis-commercial-griddle-repair.html',
        'memphis-commercial-dishwasher-repair.html',
        'memphis-commercial-cooking-equipment-repair.html',
        'memphis-steam-table-repair.html',
        'memphis-service-areas.html',
        'memphis-testimonials.html',
        'memphis-services.html',
        'memphis-ice-machine-troubleshooting.html',
        'memphis-commercial-refrigeration-troubleshooting.html',
        'memphis-commercial-oven-troubleshooting.html',
        'memphis-walk-in-cooler-maintenance.html',
        'memphis-beverage-station-slushy-machine-troubleshooting.html',
        '404.html'
    ]
    
    for f in files_to_update:
        apply_template(f)
=======
import os
import re
import subprocess
from bs4 import BeautifulSoup

template_path = r'\\wsl.localhost\Ubuntu\home\tjdot\RapidPro-Marketing\template.html'
target_dir = r'\\wsl.localhost\Ubuntu\home\tjdot\RapidPro-Marketing'

with open(template_path, 'r', encoding='utf-8') as f:
    template_content = f.read()

def get_git_file_content(filename):
    """Retrieve content of the file from the commit before the template migration."""
    try:
        # Looking for the first commit before the one that created template.html
        # Or just HEAD~1 since that's when the first migration happened.
        # But some files were migrated later.
        # We want the one BEFORE it became a template-based page (which usually has 'PAGE_CONTENT' or the new header structure).
        cmd = ["git", "show", f"HEAD~1:{filename}"]
        result = subprocess.run(cmd, cwd=target_dir, capture_output=True, text=True, encoding='utf-8')
        if result.returncode == 0:
            return result.stdout
    except Exception:
        pass
    return None

def apply_template(filename):
    filepath = os.path.join(target_dir, filename)
    if not os.path.exists(filepath):
        print(f"File {filename} not found.")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        current_content = f.read()

    # If the current file is already a template-based one (has PAGE_CONTENT or similar), 
    # we might have lost some meta info. Try to get it from git.
    old_content_for_meta = current_content
    if "<!-- PAGE_CONTENT -->" in current_content or "id=\"header\"" in current_content:
        git_content = get_git_file_content(filename)
        if git_content:
            old_content_for_meta = git_content

    soup = BeautifulSoup(old_content_for_meta, 'html.parser')

    # Extract info
    title = soup.title.string if soup.title else "Rapid Pro Maintenance"
    
    canonical = ""
    canonical_tag = soup.find('link', rel='canonical')
    if canonical_tag:
        canonical = canonical_tag.get('href', "")
    if not canonical:
        canonical = f"https://rapidpromemphis.com/{filename}"
    
    description = ""
    desc_tag = soup.find('meta', attrs={'name': 'description'})
    if desc_tag:
        description = desc_tag.get('content', "")
        
    keywords = ""
    kw_tag = soup.find('meta', attrs={'name': 'keywords'})
    if kw_tag:
        keywords = kw_tag.get('content', "")

    # Extract schema scripts
    schema_scripts = []
    for script in soup.find_all('script', type='application/ld+json'):
        schema_scripts.append(str(script))
    
    # Extract custom styles (not in files)
    custom_styles = []
    for style in soup.find_all('style'):
        # Filter out the common styles we know are in the template
        content = style.string if style.string else ""
        if "--header-height-desktop" not in content:
            custom_styles.append(str(style))

    # Identify main content
    # Strategy: Find the header and footer, take everything in between.
    # If no header/footer, use <main>. If no <main>, use body content minus known nav.
    
    body = soup.body
    if not body:
        print(f"No body found in {filename}")
        return

    # Find the header/nav to skip it
    header = body.find(['header', 'nav'])
    footer = body.find('footer')
    
    main_content = ""
    if header and footer:
        # Get all siblings between header and footer
        content_parts = []
        for sibling in header.next_siblings:
            if sibling == footer:
                break
            content_parts.append(str(sibling))
        main_content = "".join(content_parts).strip()
    elif soup.main:
        main_content = "".join([str(c) for c in soup.main.contents]).strip()
    else:
        # Fallback: just take common body contents but skip likely nav/footer
        content_parts = []
        for child in body.children:
            name = getattr(child, 'name', None)
            if name in ['header', 'nav', 'footer', 'script', 'style']:
                continue
            content_parts.append(str(child))
        main_content = "".join(content_parts).strip()

    # Final cleanup of main content: remove any accidental nested header/footer if they were nested in containers
    sub_soup = BeautifulSoup(main_content, 'html.parser')
    for tag in sub_soup.find_all(['header', 'footer']):
        tag.decompose()
    main_content = str(sub_soup)

    # Replace placeholders in template
    new_content = template_content
    new_content = new_content.replace('<!-- PAGE_TITLE -->', title)
    new_content = new_content.replace('<!-- CANONICAL_URL -->', canonical)
    new_content = new_content.replace('<!-- META_DESCRIPTION -->', description)
    new_content = new_content.replace('<!-- META_KEYWORDS -->', keywords)
    new_content = new_content.replace('<!-- OG_TITLE -->', title)
    new_content = new_content.replace('<!-- OG_DESCRIPTION -->', description)
    new_content = new_content.replace('<!-- EXTRA_STYLES -->', "\n".join(custom_styles))
    new_content = new_content.replace('<!-- EXTRA_SCRIPTS -->', "\n".join(schema_scripts))
    new_content = new_content.replace('<!-- PAGE_CONTENT -->', main_content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Optimized template applied to {filename}")

if __name__ == '__main__':
    files_to_update = [
        'germantown-kitchen-equipment-repair.html',
        'bartlett-commercial-appliance-repair.html',
        'collierville-restaurant-equipment-service.html',
        'memphis-commercial-oven-repair.html',
        'memphis-ice-machine-service.html',
        'memphis-commercial-refrigeration-services.html',
        'memphis-commercial-fryer-repair.html',
        'memphis-commercial-griddle-repair.html',
        'memphis-commercial-dishwasher-repair.html',
        'memphis-commercial-cooking-equipment-repair.html',
        'memphis-steam-table-repair.html',
        'memphis-service-areas.html',
        'memphis-testimonials.html',
        'memphis-services.html',
        'memphis-ice-machine-troubleshooting.html',
        'memphis-commercial-refrigeration-troubleshooting.html',
        'memphis-commercial-oven-troubleshooting.html',
        'memphis-walk-in-cooler-maintenance.html',
        'memphis-beverage-station-slushy-machine-troubleshooting.html',
        '404.html'
    ]
    
    for f in files_to_update:
        apply_template(f)
>>>>>>> Stashed changes
