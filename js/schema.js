document.addEventListener("DOMContentLoaded", function() {
  // Create schema.org structured data
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Rapid Pro Maintenance",
    "description": "Reliable preventative maintenance for commercial kitchen equipment in Memphis, TN and surrounding areas.",
    "image": "https://rapidpromemphis.com/images/logo.png",
    "url": "https://rapidpromemphis.com",
    "telephone": "+19012579417",
    "email": "RapidPro.Memphis@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Memphis",
      "addressRegion": "TN",
      "postalCode": "38103",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 35.1495,
      "longitude": -90.0490
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Memphis",
        "sameAs": "https://en.wikipedia.org/wiki/Memphis,_Tennessee"
      },
      {
        "@type": "City",
        "name": "Germantown"
      },
      {
        "@type": "City",
        "name": "Collierville"
      },
      {
        "@type": "City",
        "name": "Bartlett"
      },
      {
        "@type": "City",
        "name": "Cordova"
      },
      {
        "@type": "City",
        "name": "Southaven"
      },
      {
        "@type": "City",
        "name": "Olive Branch"
      }
    ],
    "priceRange": "$$$",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
      ],
      "opens": "08:00",
      "closes": "17:00"
    },
    "sameAs": [
      "https://facebook.com/rapidpromaintenance",
      "https://instagram.com/rapidpromaintenance",
      "https://linkedin.com/company/rapid-pro-maintenance"
    ],
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://rapidpromemphis.com"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Commercial Kitchen Maintenance Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Preventative Refrigeration Maintenance",
            "description": "Regular maintenance to prevent costly breakdowns during Memphis' hot summer months."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Health Department Compliance",
            "description": "Stay ahead of health department inspections with our Memphis-specific compliance service."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Walk-In Cooler & Freezer Service",
            "description": "Specialized service for large walk-in units, addressing the unique challenges of Memphis' climate."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Ice Machine Maintenance",
            "description": "Keep your ice production equipment sanitary and efficient with maintenance specifically designed for Memphis water conditions."
          }
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "86"
    },
    "review": [
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Marcus Johnson"
        },
        "reviewBody": "We're open 365 days a year serving thousands of tourists weekly. Equipment downtime isn't just inconvenient—it's catastrophic for our business. Rapid Pro keeps our kitchen running smoothly year-round with their preventative approach."
      },
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Sarah Williams"
        },
        "reviewBody": "As a farm-to-table establishment, our refrigeration systems are absolutely critical. RPM helped us set up a maintenance schedule that keeps our coolers operating at peak efficiency, resulting in longer food shelf life and less waste."
      }
    ]
  };

  // Add schema to page
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.innerHTML = JSON.stringify(schemaData);
  document.head.appendChild(script);
});

