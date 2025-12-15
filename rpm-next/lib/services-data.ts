export interface ServiceData {
    slug: string;
    title: string;
    description: string;
    icon: string;
    features: string[];
    faq: { question: string; answer: string }[];
    seoTitle: string;
    seoDesc: string;
}

export const servicesData: ServiceData[] = [
    {
        slug: "commercial-oven-repair",
        title: "Commercial Oven Repair",
        seoTitle: "Commercial Oven Repair in Memphis, TN | Gas & Electric | RPM",
        seoDesc: "Expert commercial oven repair in Memphis. We fix convection ovens, pizza ovens, and bakery ovens. 24/7 Emergency Service available. Call (901) 257-9417.",
        description: "Your kitchen stops when the oven goes cold. Our certified technicians repair all major brands of gas and electric commercial ovens, ensuring precise temperature control and reliability.",
        icon: "🔥",
        features: [
            "Convection & Combi Ovens",
            "Pizza Deck Ovens (Marsal, Blodgett)",
            "Commercial Ranges",
            "Thermostat Calibration",
            "Heating Element Replacement",
            "Gas Pilot Light Repair"
        ],
        faq: [
            {
                question: "How much does commercial oven repair cost in Memphis?",
                answer: "Commercial oven repair in Memphis typically ranges from $150-$500 depending on the issue. Common repairs include thermostat replacement, heating element repair, and igniter fixes. Call Rapid Pro Maintenance at (901) 257-9417 for a free estimate with no hidden fees."
            },
            {
                question: "Why is my commercial oven not heating evenly?",
                answer: "Uneven heating is usually caused by a faulty thermostat, broken heating element, damaged fan motor (in convection ovens), or worn door gasket. For gas ovens, check the pilot light and thermocouple. Our EPA certified technicians can diagnose and repair same-day."
            },
            {
                question: "How often should commercial ovens be serviced?",
                answer: "Commercial ovens should be professionally serviced at least every 6 months to maintain efficiency. High-volume restaurants may need quarterly maintenance. Regular service extends equipment life by 30-50%."
            },
            {
                question: "Can you fix a commercial oven pilot light that won't stay lit?",
                answer: "A pilot light that won't stay lit is typically caused by a faulty thermocouple, clogged pilot orifice, or defective gas safety valve. This is a common repair we handle daily. Call (901) 257-9417 for same-day emergency service."
            }
        ]
    },
    {
        slug: "commercial-fryer-repair",
        title: "Commercial Fryer Repair",
        seoTitle: "Commercial Fryer Repair Memphis | Deep Fryer Service | RPM",
        seoDesc: "Fast commercial deep fryer repair in Memphis. We fix gas and electric fryers, thermostat issues, and pilot lights. Same-day service available.",
        description: "Keep the crispy food coming. We diagnose and fix thermostat issues, pilot light failures, and high-limit trips on all commercial fryers. We service Pitco, Vulcan, Frymaster, and more.",
        icon: "🍟",
        features: [
            "Thermostat Calibration",
            "High Limit Switch Reset/Replace",
            "Pilot Light & Thermocouple Repair",
            "Burner Cleaning & Tuning",
            "Oil Filter Pump Repair",
            "Gas Valve Replacement"
        ],
        faq: [
            {
                question: "Why is my commercial fryer pilot light going out?",
                answer: "This often indicates a faulty thermocouple, a clogged pilot orifice, or a drafty kitchen environment affecting the flame. If the hi-limit switch trips, it cuts off gas to the pilot for safety. We can diagnose the root cause immediately."
            },
            {
                question: "Why is my fryer not reaching temperature?",
                answer: "If your fryer is slow to recover or won't heat up, it could be a weak thermostat, sediment buildup on the heating tubes/elements, or low gas pressure. Regular maintenance prevents this."
            },
            {
                question: "Do you service electric pressure fryers?",
                answer: "Yes, we service both gas and electric pressure fryers (like Henny Penny or Broaster). We carry common parts to get you back up and running quickly."
            }
        ]
    },
    {
        slug: "commercial-refrigeration-repair",
        title: "Commercial Refrigeration Repair",
        seoTitle: "Walk-In Cooler & Freezer Repair Memphis | 24/7 Emergency",
        seoDesc: "24/7 Walk-in cooler and freezer repair in Memphis. We fix compressor issues, refrigerant leaks, warm temps, and ice buildup. EPA Certified.",
        description: "Spoiled food means lost revenue. Protect your inventory with our rapid response refrigeration repair. We service walk-ins, reach-ins, prep tables, and blast chillers.",
        icon: "❄️",
        features: [
            "Compressor Replacement",
            "Refrigerant Leak Detection",
            "Fan Motor Repair",
            "Defrost Timer & Heater Issues",
            "Door Gasket Replacement",
            "Temperature Alarm Diagnostics"
        ],
        faq: [
            {
                question: "Why is my walk-in cooler freezing up?",
                answer: "Ice buildup on the evaporator coil blocks airflow and causes warm temperatures. This is often caused by a bad defrost timer, a stuck solenoid, or leaving the door open. Do not chip the ice! Call us to safely embrace and repair it."
            },
            {
                question: "How quickly can you get here for emergency refrigeration repair?",
                answer: "For emergency refrigeration calls in Memphis, we prioritize arrival. We understand you have thousands of dollars of inventory at stake. Call our 24/7 line at (901) 257-9417."
            },
            {
                question: "What brands of commercial refrigerators do you service?",
                answer: "We service all major brands including True, Manitowoc, Hoshizaki, Traulsen, Delfield, and more. Our trucks are stocked with universal parts to fix many issues on the first visit."
            }
        ]
    },
    {
        slug: "commercial-dishwasher-repair",
        title: "Commercial Dishwasher Repair",
        seoTitle: "Commercial Dishwasher Repair Memphis | Hobart & Jackson Experts",
        seoDesc: "Commercial dishwasher repair experts in Memphis. We fix high temp, low temp, and conveyor dishwashers. Call for fast service.",
        description: "Clean dishes are non-negotiable for health inspections. We keep your dish room running compliant and efficient, servicing Hobart, Jackson, CMA, and more.",
        icon: "🍽️",
        features: [
            "Pump Motor Repair",
            "Heater Element Replacement",
            "Control Board Diagnostics",
            "Solenoid Valve Replacement",
            "Wash/Rinse Arm Cleaning",
            "Chemical Dispenser Troubleshooting"
        ],
        faq: [
            {
                question: "Why is my commercial dishwasher not draining?",
                answer: "A dishwasher not draining is usually due to a clogged drain filter, a failed drain pump, or a blockage in the drain line. Check for debris first, then call us if the pump isn't engaging."
            },
            {
                question: "Why are dishes coming out dirty or spotted?",
                answer: "This is often a water temperature or pressure issue, or clogged wash arms. Low water temperature (below 120°F for chemical, 180°F for high-temp) won't sanitize or clean effectively."
            },
            {
                question: "Do you repair conveyor dishwashers?",
                answer: "Yes, we specialize in high-capacity conveyor and flight-type dish machines found in hotels and hospitals, as well as under-counter and door-type units."
            }
        ]
    },
    {
        slug: "ice-machine-repair",
        title: "Ice Machine Repair",
        seoTitle: "Ice Machine Repair Memphis | Hoshizaki, Manitowoc Service",
        seoDesc: "Commercial ice machine repair and cleaning in Memphis. We fix slow production, hollow cubes, and water leaks. Hoshizaki & Manitowoc experts.",
        description: "Don't buy bagged ice. We fix production issues, harvest cycles, and water quality problems. We recommend 6-month cleaning cycles for Memphis water conditions.",
        icon: "🧊",
        features: [
            "Scale Removal & Deep Cleaning",
            "Harvest Cycle Troublshooting",
            "Water Pump Replacement",
            "Bin Thermostat Calibration",
            "Water Filter Replacement",
            "Compressor Diagnostics"
        ],
        faq: [
            {
                question: "Why is my ice machine making hollow cubes?",
                answer: "Hollow cubes often indicate low water flow, a dirty water filter, or high water temperature. It can also point to a refrigeration issue. We can adjust the bridge thickness or cycle time to fix this."
            },
            {
                question: "How often should I clean my commercial ice machine?",
                answer: "In Memphis, due to water mineral content, we recommend professional cleaning and descaling every 6 months using nickel-safe cleaner. This prevents scale buildup that destroys expensive evaporator plates."
            },
            {
                question: "Do you service Hoshizaki and Manitowoc brands?",
                answer: "Absolutely. These are the two most common brands we service. We carry specific parts for both, including water pumps, float switches, and sensors."
            }
        ]
    },
    {
        slug: "commercial-griddle-repair",
        title: "Commercial Griddle Repair",
        seoTitle: "Commercial Griddle & Flat Top Repair Memphis",
        seoDesc: "Expert commercial griddle and flat top grill repair in Memphis. We fix thermostat calibration, uneven heating, and pilot issues.",
        description: "The workhorse of your line. We ensure your flat top maintains consistent heat across the entire plate for perfect sears and cooking times.",
        icon: "🥓",
        features: [
            "Thermostat Calibration",
            "Pilot Safety Valve Replacement",
            "Burner Tube Cleaning",
            "Chrome Top Maintenance",
            "Knob & Control Repair",
            "Gas Pressure Adjustment"
        ],
        faq: [
            {
                question: "Why does my griddle have hot and cold spots?",
                answer: "Hot spots are often caused by blocked burner ports or a failing thermostat that isn't cycling correctly. We can clean burners and calibrate thermostats to ensure even heat."
            },
            {
                question: "My griddle pilot won't stay lit, what's wrong?",
                answer: "Just like ovens, this is usually a thermocouple or safety valve issue. Grease buildup can also block airflow to the pilot. We can service this quickly to get your line back up."
            }
        ]
    },
    {
        slug: "steam-table-repair",
        title: "Steam Table & Warmer Repair",
        seoTitle: "Steam Table & Food Warmer Repair Memphis",
        seoDesc: "Commercial steam table and food warmer repair. We fix heating elements, infinite switches, and water leaks. Keep food at safe temps.",
        description: "Keep your food safe and hot. We repair wells that won't heat, water leaks, and electrical issues in steam tables and heat lamps.",
        icon: "♨️",
        features: [
            "Heating Element Replacement",
            "Infinite Switch Repair",
            "Water Pan Leak Repair",
            "Thermostat Replacement",
            "Wiring & Plug Repair",
            "Heat Lamp Bulb Socket Repair"
        ],
        faq: [
            {
                question: "Why is water leaking from my steam table?",
                answer: "Over time, the water wells can develop pinhole leaks from corrosion / hard water. We can sometimes weld these, but replacement of the well pan is often the best long-term fix."
            },
            {
                question: "Why is my steam table tripping the breaker?",
                answer: "This usually indicates a shorted heating element (water got into the electrical) or a damaged power cord. We can trace the short and replace the element safely."
            }
        ]
    }
];
