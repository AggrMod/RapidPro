#!/bin/bash
echo "=== RAPIDPRO SITE SPIDER REPORT ==="
echo "Date: $(date)"
echo ""
echo "=== PAGE STATUS CHECK ==="
pages=(
  ""
  "memphis-commercial-oven-repair.html"
  "memphis-commercial-fryer-repair.html"
  "memphis-commercial-griddle-repair.html"
  "memphis-steam-table-repair.html"
  "memphis-commercial-dishwasher-repair.html"
  "memphis-ice-machine-service.html"
  "memphis-walk-in-cooler-maintenance.html"
  "germantown-kitchen-equipment-repair.html"
  "collierville-restaurant-equipment-service.html"
  "bartlett-commercial-appliance-repair.html"
  "memphis-services.html"
  "memphis-service-areas.html"
  "memphis-testimonials.html"
  "sitemap.xml"
  "robots.txt"
)

for page in "${pages[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "https://rapidpromemphis.com/$page")
  if [ "$page" = "" ]; then
    name="/ (homepage)"
  else
    name="$page"
  fi
  echo "$status - $name"
done
