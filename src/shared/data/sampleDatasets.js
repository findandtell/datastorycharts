/**
 * Sample datasets for different chart types and use cases
 */

export const sampleDatasets = {
  generic: {
    name: "Generic 5-Stage Flow",
    description: "Simple 5-stage funnel with 3 time periods",
    data: [
      {
        Stage: "Stage 1",
        "Period 3": 10000,
        "Period 2": 9500,
        "Period 1": 9000,
      },
      {
        Stage: "Stage 2",
        "Period 3": 5000,
        "Period 2": 4750,
        "Period 1": 4500,
      },
      {
        Stage: "Stage 3",
        "Period 3": 2500,
        "Period 2": 2400,
        "Period 1": 2250,
      },
      { Stage: "Stage 4", "Period 3": 1000, "Period 2": 960, "Period 1": 900 },
      { Stage: "Stage 5", "Period 3": 500, "Period 2": 480, "Period 1": 450 },
    ],
  },

  ecommerce: {
    name: "E-commerce Funnel",
    description: "Customer journey from homepage to purchase",
    data: [
      {
        Stage: "Homepage Visit",
        "Dec 2024": 52400,
        "Nov 2024": 51200,
        "Oct 2024": 48900,
        "Sep 2024": 47100,
        "Aug 2024": 45800,
        "Jul 2024": 44300,
        "Jun 2024": 43200,
      },
      {
        Stage: "Product View",
        "Dec 2024": 16200,
        "Nov 2024": 15800,
        "Oct 2024": 14900,
        "Sep 2024": 14300,
        "Aug 2024": 13800,
        "Jul 2024": 13100,
        "Jun 2024": 12700,
      },
      {
        Stage: "Add to Cart",
        "Dec 2024": 4890,
        "Nov 2024": 4720,
        "Oct 2024": 4480,
        "Sep 2024": 4250,
        "Aug 2024": 4050,
        "Jul 2024": 3920,
        "Jun 2024": 3780,
      },
      {
        Stage: "Checkout",
        "Dec 2024": 1680,
        "Nov 2024": 1720,
        "Oct 2024": 1850,
        "Sep 2024": 2980,
        "Aug 2024": 2850,
        "Jul 2024": 2760,
        "Jun 2024": 2650,
      },
      {
        Stage: "Purchase",
        "Dec 2024": 1340,
        "Nov 2024": 1370,
        "Oct 2024": 1480,
        "Sep 2024": 2380,
        "Aug 2024": 2280,
        "Jul 2024": 2210,
        "Jun 2024": 2120,
      },
    ],
  },

  saas: {
    name: "SaaS Sales Funnel",
    description: "B2B software sales pipeline",
    data: [
      {
        Stage: "Website Visitors",
        "Q4 2024": 125000,
        "Q3 2024": 118000,
        "Q2 2024": 112000,
      },
      {
        Stage: "Trial Signups",
        "Q4 2024": 8750,
        "Q3 2024": 8260,
        "Q2 2024": 7840,
      },
      {
        Stage: "Active Users",
        "Q4 2024": 4375,
        "Q3 2024": 4130,
        "Q2 2024": 3920,
      },
      {
        Stage: "Sales Qualified",
        "Q4 2024": 1750,
        "Q3 2024": 1652,
        "Q2 2024": 1568,
      },
      {
        Stage: "Paying Customers",
        "Q4 2024": 525,
        "Q3 2024": 496,
        "Q2 2024": 470,
      },
    ],
  },

  marketing: {
    name: "Marketing Campaign",
    description: "Campaign performance tracking",
    data: [
      {
        Stage: "Impressions",
        "Week 4": 2500000,
        "Week 3": 2350000,
        "Week 2": 2200000,
        "Week 1": 2100000,
      },
      {
        Stage: "Clicks",
        "Week 4": 75000,
        "Week 3": 70500,
        "Week 2": 66000,
        "Week 1": 63000,
      },
      {
        Stage: "Landing Page",
        "Week 4": 52500,
        "Week 3": 49350,
        "Week 2": 46200,
        "Week 1": 44100,
      },
      {
        Stage: "Form Submission",
        "Week 4": 10500,
        "Week 3": 9870,
        "Week 2": 9240,
        "Week 1": 8820,
      },
      {
        Stage: "Qualified Leads",
        "Week 4": 3150,
        "Week 3": 2961,
        "Week 2": 2772,
        "Week 1": 2646,
      },
    ],
  },

  content: {
    name: "Content/Media Funnel",
    description: "Content engagement and conversion",
    data: [
      {
        Stage: "Article Views",
        "March": 450000,
        "February": 425000,
        "January": 400000,
      },
      {
        Stage: "Read 50%+",
        "March": 135000,
        "February": 127500,
        "January": 120000,
      },
      {
        Stage: "Engaged (comments/shares)",
        "March": 27000,
        "February": 25500,
        "January": 24000,
      },
      {
        Stage: "Newsletter Signup",
        "March": 9000,
        "February": 8500,
        "January": 8000,
      },
      {
        Stage: "Premium Subscriber",
        "March": 1800,
        "February": 1700,
        "January": 1600,
      },
    ],
  },

  mobileApp: {
    name: "Mobile App Funnel",
    description: "App user journey and retention",
    data: [
      {
        Stage: "App Install",
        "This Month": 85000,
        "Last Month": 78000,
        "2 Months Ago": 72000,
      },
      {
        Stage: "Account Created",
        "This Month": 59500,
        "Last Month": 54600,
        "2 Months Ago": 50400,
      },
      {
        Stage: "Feature Used",
        "This Month": 42500,
        "Last Month": 39000,
        "2 Months Ago": 36000,
      },
      {
        Stage: "Day 7 Active",
        "This Month": 25500,
        "Last Month": 23400,
        "2 Months Ago": 21600,
      },
      {
        Stage: "Day 30 Retained",
        "This Month": 12750,
        "Last Month": 11700,
        "2 Months Ago": 10800,
      },
    ],
  },

  b2bLeads: {
    name: "B2B Lead Generation",
    description: "Enterprise sales funnel",
    data: [
      {
        Stage: "Marketing Qualified Lead",
        "Q1 2025": 3200,
        "Q4 2024": 2950,
        "Q3 2024": 2800,
      },
      {
        Stage: "Sales Accepted Lead",
        "Q1 2025": 1920,
        "Q4 2024": 1770,
        "Q3 2024": 1680,
      },
      {
        Stage: "Opportunity",
        "Q1 2025": 960,
        "Q4 2024": 885,
        "Q3 2024": 840,
      },
      {
        Stage: "Proposal",
        "Q1 2025": 480,
        "Q4 2024": 443,
        "Q3 2024": 420,
      },
      {
        Stage: "Closed Won",
        "Q1 2025": 192,
        "Q4 2024": 177,
        "Q3 2024": 168,
      },
    ],
  },

  // Comparison datasets
  ageComparison: {
    name: "Age Group Comparison",
    description: "Compare conversion by age demographics",
    data: [
      {
        Stage: "Awareness",
        "18-24": 15000,
        "25-34": 22000,
        "35-44": 18000,
        "45-54": 12000,
        "55+": 8000,
      },
      {
        Stage: "Interest",
        "18-24": 7500,
        "25-34": 13200,
        "35-44": 10800,
        "45-54": 7200,
        "55+": 5600,
      },
      {
        Stage: "Consideration",
        "18-24": 3750,
        "25-34": 7920,
        "35-44": 7560,
        "45-54": 5040,
        "55+": 4480,
      },
      {
        Stage: "Intent",
        "18-24": 1500,
        "25-34": 3960,
        "35-44": 4536,
        "45-54": 3024,
        "55+": 3136,
      },
      {
        Stage: "Purchase",
        "18-24": 450,
        "25-34": 1584,
        "35-44": 2268,
        "45-54": 1814,
        "55+": 2195,
      },
    ],
  },

  abTest: {
    name: "A/B Test Comparison",
    description: "Compare control vs variation performance",
    data: [
      {
        Stage: "Visitors",
        "Control": 50000,
        "Variation A": 50000,
        "Variation B": 50000,
      },
      {
        Stage: "Engagement",
        "Control": 17500,
        "Variation A": 19000,
        "Variation B": 18500,
      },
      {
        Stage: "Sign Up",
        "Control": 3500,
        "Variation A": 4180,
        "Variation B": 3885,
      },
      {
        Stage: "Activation",
        "Control": 1750,
        "Variation A": 2299,
        "Variation B": 2138,
      },
      {
        Stage: "Conversion",
        "Control": 525,
        "Variation A": 736,
        "Variation B": 663,
      },
    ],
  },

  deviceComparison: {
    name: "Device Comparison",
    description: "Compare user behavior across devices",
    data: [
      {
        Stage: "Sessions",
        "Desktop": 45000,
        "Mobile": 65000,
        "Tablet": 15000,
      },
      {
        Stage: "Product View",
        "Desktop": 22500,
        "Mobile": 29250,
        "Tablet": 8250,
      },
      {
        Stage: "Add to Cart",
        "Desktop": 11250,
        "Mobile": 11700,
        "Tablet": 4125,
      },
      {
        Stage: "Checkout",
        "Desktop": 6750,
        "Mobile": 5850,
        "Tablet": 2475,
      },
      {
        Stage: "Purchase",
        "Desktop": 5400,
        "Mobile": 3510,
        "Tablet": 1733,
      },
    ],
  },

  channelComparison: {
    name: "Channel Comparison",
    description: "Compare marketing channel performance",
    data: [
      {
        Stage: "Visits",
        "Organic": 85000,
        "Paid Search": 45000,
        "Social": 38000,
        "Email": 22000,
        "Direct": 15000,
      },
      {
        Stage: "Engagement",
        "Organic": 42500,
        "Paid Search": 27000,
        "Social": 19000,
        "Email": 15400,
        "Direct": 10500,
      },
      {
        Stage: "Lead",
        "Organic": 12750,
        "Paid Search": 10800,
        "Social": 5700,
        "Email": 8470,
        "Direct": 5250,
      },
      {
        Stage: "Qualified",
        "Organic": 5100,
        "Paid Search": 5400,
        "Social": 1710,
        "Email": 4659,
        "Direct": 2625,
      },
      {
        Stage: "Customer",
        "Organic": 2040,
        "Paid Search": 2430,
        "Social": 513,
        "Email": 2330,
        "Direct": 1313,
      },
    ],
  },

  timeComparison: {
    name: "Weekday vs Weekend",
    description: "Compare behavior patterns by time",
    data: [
      {
        Stage: "Traffic",
        "Weekday": 125000,
        "Weekend": 85000,
      },
      {
        Stage: "Engagement",
        "Weekday": 50000,
        "Weekend": 42500,
      },
      {
        Stage: "Browse Products",
        "Weekday": 25000,
        "Weekend": 25500,
      },
      {
        Stage: "Add to Cart",
        "Weekday": 10000,
        "Weekend": 12750,
      },
      {
        Stage: "Purchase",
        "Weekday": 4000,
        "Weekend": 6375,
      },
    ],
  },
};

/**
 * Get a sample dataset by key
 */
export const getSampleDataset = (key) => {
  return sampleDatasets[key] || null;
};

/**
 * Get all sample dataset keys
 */
export const getSampleDatasetKeys = () => {
  return Object.keys(sampleDatasets);
};

/**
 * Check if a dataset key is a comparison dataset
 */
export const isComparisonDataset = (key) => {
  const comparisonKeys = [
    "ageComparison",
    "abTest",
    "deviceComparison",
    "channelComparison",
    "timeComparison",
  ];
  return comparisonKeys.includes(key);
};
