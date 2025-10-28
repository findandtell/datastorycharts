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

  // Slope Chart datasets
  slopeDefault: {
    name: "Market Share Change",
    description: "Year-over-year market share change",
    data: [
      { Stage: "A", "2015": 20, "2016": 20 },
      { Stage: "B", "2015": 18, "2016": 19 },
      { Stage: "C", "2015": 17, "2016": 18 },
      { Stage: "D", "2015": 17, "2016": 17 },
      { Stage: "E", "2015": 14, "2016": 13 },
      { Stage: "F", "2015": 13, "2016": 12 },
      { Stage: "G", "2015": 12, "2016": 11 },
      { Stage: "H", "2015": 11, "2016": 8 },
      { Stage: "I", "2015": 10, "2016": 4 },
      { Stage: "J", "2015": 7, "2016": 9 },
    ],
  },

  slopeRevenue: {
    name: "Revenue by Product Line",
    description: "Annual revenue comparison across product categories",
    data: [
      { Stage: "Cloud Services", "2023": 45, "2024": 62 },
      { Stage: "Software Licenses", "2023": 38, "2024": 35 },
      { Stage: "Consulting", "2023": 28, "2024": 31 },
      { Stage: "Support & Maintenance", "2023": 22, "2024": 25 },
      { Stage: "Training", "2023": 15, "2024": 18 },
      { Stage: "Hardware", "2023": 12, "2024": 9 },
    ],
  },

  slopeCustomerSatisfaction: {
    name: "Customer Satisfaction Scores",
    description: "NPS scores before and after product improvements",
    data: [
      { Stage: "Product Quality", "Before": 72, "After": 85 },
      { Stage: "Customer Service", "Before": 68, "After": 79 },
      { Stage: "Ease of Use", "Before": 65, "After": 82 },
      { Stage: "Value for Money", "Before": 61, "After": 74 },
      { Stage: "Speed/Performance", "Before": 58, "After": 76 },
      { Stage: "Documentation", "Before": 52, "After": 68 },
      { Stage: "Onboarding", "Before": 48, "After": 71 },
    ],
  },

  slopeEmployeeMetrics: {
    name: "Employee Engagement",
    description: "Engagement scores Q1 vs Q4",
    data: [
      { Stage: "Arizona", "Q1": 87, "Q4": 89 },
      { Stage: "Washington", "Q1": 82, "Q4": 88 },
      { Stage: "Texas", "Q1": 79, "Q4": 85 },
      { Stage: "Delaware", "Q1": 78, "Q4": 78 },
      { Stage: "Nevada", "Q1": 74, "Q4": 71 },
      { Stage: "Florida", "Q1": 71, "Q4": 68 },
      { Stage: "Ohio", "Q1": 68, "Q4": 64 },
    ],
  },

  slopeWebsiteMetrics: {
    name: "Website Performance",
    description: "Key metrics before and after redesign",
    data: [
      { Stage: "Page Load Time (s)", "Old Site": 4.2, "New Site": 1.8 },
      { Stage: "Bounce Rate (%)", "Old Site": 62, "New Site": 38 },
      { Stage: "Avg Session (min)", "Old Site": 2.4, "New Site": 4.7 },
      { Stage: "Pages per Session", "Old Site": 3.1, "New Site": 5.8 },
      { Stage: "Conversion Rate (%)", "Old Site": 2.3, "New Site": 4.9 },
      { Stage: "Mobile Traffic (%)", "Old Site": 42, "New Site": 68 },
    ],
  },

  slopeMarketShare: {
    name: "Smartphone Market Share",
    description: "Global market share changes year over year",
    data: [
      { Stage: "Apple", "2023": 28, "2024": 26 },
      { Stage: "Samsung", "2023": 24, "2024": 25 },
      { Stage: "Xiaomi", "2023": 14, "2024": 16 },
      { Stage: "OPPO", "2023": 11, "2024": 12 },
      { Stage: "Vivo", "2023": 9, "2024": 10 },
      { Stage: "Others", "2023": 14, "2024": 11 },
    ],
  },

  slopeEducation: {
    name: "Student Performance",
    description: "Test scores before and after intervention program",
    data: [
      { Stage: "Mathematics", "Pre-Test": 68, "Post-Test": 82 },
      { Stage: "Reading", "Pre-Test": 74, "Post-Test": 84 },
      { Stage: "Writing", "Pre-Test": 71, "Post-Test": 79 },
      { Stage: "Science", "Pre-Test": 65, "Post-Test": 77 },
      { Stage: "Social Studies", "Pre-Test": 72, "Post-Test": 78 },
    ],
  },

  slopeHealthcare: {
    name: "Patient Health Outcomes",
    description: "Health indicators before and after treatment",
    data: [
      { Stage: "Blood Pressure", "Baseline": 145, "3 Months": 128 },
      { Stage: "Cholesterol", "Baseline": 240, "3 Months": 195 },
      { Stage: "Weight (kg)", "Baseline": 92, "3 Months": 84 },
      { Stage: "Blood Sugar", "Baseline": 156, "3 Months": 118 },
      { Stage: "Exercise (min/week)", "Baseline": 45, "3 Months": 180 },
    ],
  },

  // Bar Chart datasets
  barSimple: {
    name: "Units Produced by Region",
    description: "Production units by regional location",
    data: [
      { Category: "East", "Jan": 41427 },
      { Category: "Central", "Jan": 37284 },
      { Category: "North", "Jan": 22371 },
      { Category: "West", "Jan": 20134 },
    ],
  },

  barRegionalSales: {
    name: "Sales Performance by Region",
    description: "Compare regional sales across multiple quarters",
    data: [
      { Category: "North America", "Q1 2024": 245000, "Q2 2024": 298000, "Q3 2024": 312000 },
      { Category: "Europe", "Q1 2024": 189000, "Q2 2024": 215000, "Q3 2024": 228000 },
      { Category: "Asia Pacific", "Q1 2024": 156000, "Q2 2024": 198000, "Q3 2024": 245000 },
      { Category: "Latin America", "Q1 2024": 98000, "Q2 2024": 112000, "Q3 2024": 125000 },
    ],
  },

  barMarketingChannels: {
    name: "Marketing Channel Performance",
    description: "Compare marketing channel effectiveness (conversions)",
    data: [
      { Category: "Organic Search", "2023": 12500, "2024": 15800 },
      { Category: "Paid Social", "2023": 8900, "2024": 11200 },
      { Category: "Email Marketing", "2023": 6700, "2024": 7400 },
      { Category: "Direct Traffic", "2023": 5200, "2024": 5800 },
      { Category: "Referral", "2023": 3400, "2024": 4100 },
    ],
  },

  barProductRevenue: {
    name: "Product Category Revenue",
    description: "E-commerce revenue by product category",
    data: [
      { Category: "Electronics", "Jan": 145000, "Feb": 132000, "Mar": 168000 },
      { Category: "Clothing", "Jan": 98000, "Feb": 115000, "Mar": 122000 },
      { Category: "Home & Garden", "Jan": 76000, "Feb": 82000, "Mar": 91000 },
      { Category: "Sports", "Jan": 62000, "Feb": 71000, "Mar": 78000 },
      { Category: "Books", "Jan": 34000, "Feb": 38000, "Mar": 41000 },
    ],
  },

  barTeamPerformance: {
    name: "Team Performance Metrics",
    description: "Track team productivity across quarters",
    data: [
      { Category: "Engineering", "Q1": 145, "Q2": 162, "Q3": 178, "Q4": 189 },
      { Category: "Product", "Q1": 98, "Q2": 112, "Q3": 125, "Q4": 134 },
      { Category: "Design", "Q1": 76, "Q2": 84, "Q3": 91, "Q4": 98 },
      { Category: "Marketing", "Q1": 112, "Q2": 128, "Q3": 145, "Q4": 156 },
    ],
  },

  barCustomerAcquisition: {
    name: "Customer Acquisition by Source",
    description: "New customers acquired through different channels",
    data: [
      { Category: "Google Ads", "Month 1": 450, "Month 2": 520, "Month 3": 580 },
      { Category: "Facebook Ads", "Month 1": 380, "Month 2": 420, "Month 3": 390 },
      { Category: "Content Marketing", "Month 1": 290, "Month 2": 340, "Month 3": 410 },
      { Category: "Partnerships", "Month 1": 180, "Month 2": 210, "Month 3": 245 },
      { Category: "Events", "Month 1": 120, "Month 2": 95, "Month 3": 145 },
    ],
  },

  barElectionOpinion: {
    name: "Election Administration Opinion",
    description: "Voter opinions on election administration (grouped-stacked style)",
    data: [
      {
        "Period": "Nov '18",
        "All Voters - Very Well": 21,
        "All Voters - Somewhat Well": 54,
        "Rep Candidate Voters - Very Well": 24,
        "Rep Candidate Voters - Somewhat Well": 35,
        "Dem Candidate Voters - Very Well": 19,
        "Dem Candidate Voters - Somewhat Well": 54
      },
      {
        "Period": "Nov '20",
        "All Voters - Very Well": 35,
        "All Voters - Somewhat Well": 24,
        "Rep Candidate Voters - Very Well": 14,
        "Rep Candidate Voters - Somewhat Well": 39,
        "Dem Candidate Voters - Very Well": 64,
        "Dem Candidate Voters - Somewhat Well": 30
      },
      {
        "Period": "Nov '22",
        "All Voters - Very Well": 37,
        "All Voters - Somewhat Well": 37,
        "Rep Candidate Voters - Very Well": 39,
        "Rep Candidate Voters - Somewhat Well": 54,
        "Dem Candidate Voters - Very Well": 61,
        "Dem Candidate Voters - Somewhat Well": 35
      },
      {
        "Period": "Nov '24",
        "All Voters - Very Well": 43,
        "All Voters - Somewhat Well": 45,
        "Rep Candidate Voters - Very Well": 47,
        "Rep Candidate Voters - Somewhat Well": 37,
        "Dem Candidate Voters - Very Well": 47,
        "Dem Candidate Voters - Somewhat Well": 37
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
