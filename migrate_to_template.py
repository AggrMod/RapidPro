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
