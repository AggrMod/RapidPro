import os
import re

template_path = r'\\wsl.localhost\Ubuntu\home\tjdot\RapidPro-Marketing\template.html'
target_dir = r'\\wsl.localhost\Ubuntu\home\tjdot\RapidPro-Marketing'

with open(template_path, 'r', encoding='utf-8') as f:
    template_content = f.read()

def apply_template(filename):
    filepath = os.path.join(target_dir, filename)
    if not os.path.exists(filepath):
        print(f"File {filename} not found.")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        old_content = f.read()

    # Extract info from old content
    title_match = re.search(r'<title>(.*?)</title>', old_content, re.IGNORECASE | re.DOTALL)
    title = title_match.group(1) if title_match else "Rapid Pro Maintenance"
    
    canonical_match = re.search(r'<link rel="canonical" href="(.*?)">', old_content, re.IGNORECASE)
    canonical = canonical_match.group(1) if canonical_match else f"https://rapidpromemphis.com/{filename}"
    
    desc_match = re.search(r'<meta name="description" content="(.*?)">', old_content, re.IGNORECASE)
    description = desc_match.group(1) if desc_match else ""
    
    kw_match = re.search(r'<meta name="keywords" content="(.*?)">', old_content, re.IGNORECASE)
    keywords = kw_match.group(1) if kw_match else ""

    # Extract custom styles (anything in <style> that isn't empty)
    styles_match = re.search(r'<style>(.*?)</style>', old_content, re.IGNORECASE | re.DOTALL)
    extra_styles = styles_match.group(1).strip() if styles_match else ""

    # Extract schema scripts
    schema_scripts = "\n".join(re.findall(r'<script type="application/ld\+json">(.*?)</script>', old_content, re.IGNORECASE | re.DOTALL))
    if schema_scripts:
        schema_scripts = f'<script type="application/ld+json">{schema_scripts}</script>'

    # Extract main content
    main_match = re.search(r'<main>(.*?)</main>', old_content, re.IGNORECASE | re.DOTALL)
    main_content = main_match.group(1).strip() if main_match else "Content not found."

    # Replace placeholders in template
    new_content = template_content
    new_content = new_content.replace('<!-- PAGE_TITLE -->', title)
    new_content = new_content.replace('<!-- CANONICAL_URL -->', canonical)
    new_content = new_content.replace('<!-- META_DESCRIPTION -->', description)
    new_content = new_content.replace('<!-- META_KEYWORDS -->', keywords)
    new_content = new_content.replace('<!-- OG_TITLE -->', title)
    new_content = new_content.replace('<!-- OG_DESCRIPTION -->', description)
    new_content = new_content.replace('<!-- EXTRA_STYLES -->', extra_styles)
    new_content = new_content.replace('<!-- EXTRA_SCRIPTS -->', schema_scripts)
    new_content = new_content.replace('<!-- PAGE_CONTENT -->', main_content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Applied template to {filename}")

if __name__ == '__main__':
    # List of files to update (starting with Germantown as requested)
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
        'memphis-steam-table-repair.html'
    ]
    
    for f in files_to_update:
        apply_template(f)
