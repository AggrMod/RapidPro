# Rapid Pro Maintenance Customer Data Setup

This document explains how to set up the Rapid Pro Maintenance dashboard with real restaurant data based on the restaurant list.

## Overview

The Rapid Pro Maintenance system includes a script that automatically converts the Memphis restaurant list into a customer database for the dashboard. This allows you to:

1. Have real Memphis restaurants as potential clients in the system
2. Generate optimized schedules based on restaurant locations
3. Create customer profiles with realistic contact information and equipment details
4. Populate the dashboard with actual restaurant data for demonstrations

## Installation

### Prerequisites

- Node.js (version 12 or higher)
- Bash shell

### Setup Steps

1. Ensure you are in the project root directory (`rapid-pro-maintenance`)

2. Run the setup script:
   ```bash
   ./setup-customer-data.sh
   ```

3. The script will:
   - Process the restaurant list in `restaurant_list.txt`
   - Generate the customer database in `dashboard/data/customer-database.json`
   - Create supporting data files for equipment types, brands, etc.
   - Generate an optimized visit schedule in `restaurant_schedule_updated.md`

4. After successful execution, your dashboard will be populated with data from actual Memphis restaurants.

## Generated Files

The setup creates several important files:

- `dashboard/data/customer-database.json` - Complete customer database with contact info and equipment details
- `dashboard/data/client-lookup.json` - Simplified customer data for quick search functionality
- `dashboard/data/equipment-brands.json` - List of equipment manufacturers
- `dashboard/data/equipment-types.json` - List of equipment categories
- `dashboard/data/pm-sessions.json` - Scheduled PM sessions based on the restaurant schedule
- `restaurant_schedule_updated.md` - An optimized weekly visit schedule

## Using the Data

Once the data is set up, you can:

1. Log in to the dashboard (any email/password will work)
2. Browse the customer list with real Memphis restaurants
3. View the scheduled PM sessions
4. Create new PM sessions for any restaurant
5. Complete PM workflows for scheduled visits

## Restaurant Categorization

The script automatically categorizes restaurants by neighborhood based on address patterns:

- Downtown Memphis
- Midtown Memphis
- East Memphis
- Germantown/Collierville
- Bartlett/Cordova
- South Memphis
- Whitehaven
- North Memphis
- Hickory Hill

The weekly schedule is optimized to focus on specific areas each day to minimize travel time.

## Equipment Simulation

Each restaurant is assigned realistic equipment types based on their category:

- Fine dining establishments have more specialized equipment (wine coolers, blast chillers)
- Cafes and coffee shops have smaller refrigeration units
- Ethnic restaurants have specialized equipment depending on cuisine
- BBQ restaurants have smokehouse cooling equipment

Each piece of equipment has realistic:
- Brand (based on equipment type)
- Model number
- Serial number
- Installation date

## Customization

If you want to customize the generated data:

1. Edit the `js/restaurant-customer-generator.js` file to modify how restaurant data is processed
2. Edit the `js/restaurant-schedule-generator.js` file to change how schedules are created
3. Run the setup script again to regenerate the data

## Troubleshooting

If you encounter issues:

1. Ensure Node.js is installed and available in your PATH
2. Check that the restaurant list file exists at `restaurant_list.txt`
3. Verify you have write permission in the `dashboard/data` directory
4. Examine error messages from the setup script for specific issues

For further assistance, refer to the team notes or contact the development team.