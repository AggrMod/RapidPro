import os
from google import genai
from pathlib import Path

# Set API key
os.environ['GOOGLE_API_KEY'] = 'AIzaSyAPoYxvGhs2_JfMr8prnzwKiHwzbbqN-D0'

client = genai.Client()

FUNNELS = [
    ('memphis-commercial-oven-repair', 'Professional technician repairing commercial oven in restaurant kitchen'),
    ('memphis-fryer-repair', 'Professional technician servicing commercial deep fryer'),
    ('memphis-dishwasher-repair', 'Professional technician repairing commercial dishwasher'),
    ('memphis-ice-machine-service', 'Professional technician maintaining commercial ice machine'),
    ('memphis-walk-in-cooler-maintenance', 'Professional technician inspecting walk-in cooler gaskets'),
    ('memphis-steam-table-repair', 'Professional technician repairing commercial steam table'),
    ('memphis-griddle-repair', 'Professional technician servicing flat top commercial griddle'),
    ('germantown-kitchen-equipment-repair', 'Professional kitchen equipment technician with tools'),
    ('collierville-restaurant-equipment-service', 'Professional technician repairing restaurant equipment'),
    ('bartlett-commercial-appliance-repair', 'Professional appliance repair technician working on kitchen equipment'),
]

Path('images/funnel').mkdir(parents=True, exist_ok=True)

for slug, prompt in FUNNELS:
    print(f'Generating {slug}...')
    try:
        response = client.models.generate_images(
            model='imagen-3.0-fast-generate-001',
            prompt=prompt,
            config={'number_of_images': 1}
        )
        if response.generated_images:
            img = response.generated_images[0]
            img_path = f'images/funnel/{slug}.png'
            img.image.save(img_path)
            print(f'  Saved: {img_path}')
    except Exception as e:
        print(f'  Error: {e}')
