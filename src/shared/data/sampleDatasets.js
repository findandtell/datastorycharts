/**
 * Sample datasets for different chart types and use cases
 *
 * IMPORTANT: Default Dataset Loading with Style Presets
 *
 * Each sample dataset can include a `stylePreset` property that references an external JSON style file.
 * When a dataset with a stylePreset is loaded, ALL styling from that file is automatically applied,
 * including:
 * - Title and subtitle text
 * - Typography (font family, sizes, weights)
 * - Color palettes and schemes
 * - Canvas dimensions and layout
 * - Chart-specific settings (line styles, bar spacing, etc.)
 *
 * How Style Presets Work:
 * 1. Dataset defines stylePreset property pointing to a JSON file path (e.g., "/Examples/my-style.json")
 * 2. When dataset is selected in ChartEditor, the applyStylePreset function is called
 * 3. Style file is fetched and validated (must have styleVersion property)
 * 4. ALL settings from the style file override current chart settings
 * 5. This ensures consistent, professional defaults for each chart type
 *
 * Example - Line Chart Default:
 * marketingChannelRevenue: {
 *   name: "Marketing Channel Revenue",
 *   stylePreset: "/Examples/affiliate-revenue-disappeared-in-january-line-style-2025-11-05.json",
 *   // ... data and other properties
 * }
 *
 * When navigating to /chart/line, this dataset loads automatically with its complete styling:
 * - Title: "Affiliate Revenue Steep Decline in November"
 * - Font: Lora
 * - Custom color palette
 * - All layout and chart-specific settings from the JSON file
 *
 * Note: The ChartEditor useEffect includes critical logic to ensure these defaults load correctly
 * on first navigation, even when React state persists from previous sessions.
 */

/**
 * Helper function to generate daily sales data
 */
function generateDailySalesData(startDate, days) {
  const data = [];
  const start = new Date(startDate);

  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    // Generate realistic patterns with weekly and monthly seasonality
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const monthProgress = date.getDate() / 30; // 0 to 1 through the month

    // Base values with trends
    const baseRevenue = 25000 + (i / days) * 15000; // Growing trend
    const baseOrders = 180 + (i / days) * 80;
    const baseConversion = 2.8 + (i / days) * 0.7;

    // Weekend dip (70% of weekday)
    const weekendFactor = isWeekend ? 0.7 : 1.0;

    // End-of-month spike (up to 130%)
    const monthEndFactor = monthProgress > 0.8 ? 1.0 + (monthProgress - 0.8) * 1.5 : 1.0;

    // Random daily variation (±15%)
    const randomFactor = 0.85 + Math.random() * 0.3;

    const revenue = Math.round(baseRevenue * weekendFactor * monthEndFactor * randomFactor);
    const orders = Math.round(baseOrders * weekendFactor * monthEndFactor * randomFactor);
    const conversionRate = Number((baseConversion * weekendFactor * randomFactor).toFixed(2));

    data.push({
      date: dateStr,
      Revenue: revenue,
      Orders: orders,
      ConversionRate: conversionRate,
    });
  }

  return data;
}

/**
 * Helper function to generate clothing retail sales data with seasonality
 */
// Memoized clothing retail data generation
let cachedClothingRetailData = null;

function generateClothingRetailData(startDate, days) {
  // Return cached data if already generated
  if (cachedClothingRetailData) {
    return cachedClothingRetailData;
  }

  const data = [];
  const startTime = new Date(startDate).getTime();
  const dayInMs = 24 * 60 * 60 * 1000;

  // Base sales values for each category
  const baseShoes = 850;
  const baseShirts = 1200;
  const basePants = 950;
  const baseSocks = 450;
  const baseAccessories = 380;

  for (let i = 0; i < days; i++) {
    const currentTime = startTime + (i * dayInMs);
    const date = new Date(currentTime);
    const dateStr = date.toISOString().split('T')[0];
    const month = date.getMonth() + 1; // 1-12
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Weekend factor (shopping increases on weekends)
    const weekendFactor = isWeekend ? 1.25 : 1.0;

    // Back to School seasonality (July-August)
    const backToSchoolFactor = (month === 7 || month === 8)
      ? 1.3 + ((month === 7 ? 0.5 : 1.0) * 0.5) // 1.3x to 1.8x
      : 1.0;

    // Holiday seasonality (November-December)
    const holidayFactor = (month === 11 || month === 12)
      ? 1.5 + ((month === 11 ? 0.6 : 1.0) * 0.8) // 1.5x to 2.3x
      : 1.0;

    // Growth trend over 2 years (30% growth)
    const trendFactor = 1.0 + (i / days) * 0.3;

    // Random daily variation (±20%) - using single random call per metric
    const rand = () => 0.8 + Math.random() * 0.4;

    // Calculate final values with all factors
    data.push({
      date: dateStr,
      Shoes: Math.round(baseShoes * weekendFactor * backToSchoolFactor * holidayFactor * trendFactor * rand()),
      Shirts: Math.round(baseShirts * weekendFactor * backToSchoolFactor * holidayFactor * trendFactor * rand()),
      Pants: Math.round(basePants * weekendFactor * backToSchoolFactor * holidayFactor * trendFactor * rand()),
      Socks: Math.round(baseSocks * weekendFactor * backToSchoolFactor * holidayFactor * trendFactor * rand()),
      Accessories: Math.round(baseAccessories * weekendFactor * holidayFactor * trendFactor * rand()),
    });
  }

  // Cache the generated data
  cachedClothingRetailData = data;
  return data;
}

export const sampleDatasets = {
  generic: {
    name: "Generic 5-Stage Flow",
    description: "Simple 5-stage funnel with 3 time periods",
    title: "Website Conversion Funnel",
    subtitle: "Visitor journey from page views to purchases",
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
    title: "E-Commerce Sales Funnel",
    subtitle: "Customer conversion from product views to checkout completion",
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
    title: "SaaS User Onboarding Funnel",
    subtitle: "Trial user activation and conversion to paid subscribers",
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
    title: "Marketing Campaign Performance",
    subtitle: "Lead generation and conversion across campaign stages",
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
    title: "Content Engagement Funnel",
    subtitle: "Reader journey from discovery to newsletter subscription",
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
    title: "Mobile App User Funnel",
    subtitle: "User activation from app install to first purchase",
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
    title: "B2B Sales Pipeline",
    subtitle: "Enterprise lead qualification and deal closure rates",
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
    title: "Conversion by Age Group",
    subtitle: "User engagement across different demographic segments",
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
    title: "A/B Test Results: 43% Improvement",
    subtitle: "Variation A Exceeded Expectations: 4.6% Conversion to Activation",
    stylePreset: "/Examples/ab-test-funnel-wsj-style.json",
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
    title: "Conversion by Device Type",
    subtitle: "Mobile, desktop, and tablet user behavior comparison",
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
    title: "Marketing Channel Performance",
    subtitle: "Conversion rates across organic, paid, and social channels",
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
    title: "Quarter-over-Quarter Performance",
    subtitle: "Q3 2023 vs. Q4 2023 conversion trends",
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
    title: "Regional Performance Trends",
    subtitle: "Year-over-year metric changes by region",
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
    title: "Product Line Revenue Growth",
    subtitle: "Annual revenue comparison: 2023 vs. 2024",
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
    title: "Customer Satisfaction Score Changes",
    subtitle: "CSAT improvement across product categories",
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
    title: "Department Performance Metrics",
    subtitle: "Annual employee productivity trends by department",
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
    title: "Website Traffic Sources",
    subtitle: "Channel performance shifts over the past year",
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
    title: "Competitive Market Position",
    subtitle: "Market share changes in enterprise software sector",
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
    title: "Student Performance by Subject",
    subtitle: "Academic achievement trends across core subjects",
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
    title: "Patient Health Outcomes",
    subtitle: "Quality metrics improvement across treatment areas",
    data: [
      { Stage: "Blood Pressure", "Baseline": 145, "3 Months": 128 },
      { Stage: "Cholesterol", "Baseline": 240, "3 Months": 195 },
      { Stage: "Weight (kg)", "Baseline": 92, "3 Months": 84 },
      { Stage: "Blood Sugar", "Baseline": 156, "3 Months": 118 },
      { Stage: "Exercise (min/week)", "Baseline": 45, "3 Months": 180 },
    ],
  },

  // AI Created Styled Slope Charts
  aiTechRevenue: {
    name: "AI Created - Tech Revenue Revolution",
    description: "Styled data story: Cloud dominating traditional software",
    title: "The Cloud Revolution",
    subtitle: "How modern tech stacks are reshaping revenue streams",
    data: [
      { Stage: "Cloud Services", "2023": 45, "2024": 62 },
      { Stage: "Software Licenses", "2023": 38, "2024": 35 },
      { Stage: "Consulting", "2023": 28, "2024": 31 },
      { Stage: "Support & Maintenance", "2023": 22, "2024": 25 },
      { Stage: "Training", "2023": 15, "2024": 18 },
      { Stage: "Hardware", "2023": 12, "2024": 9 },
    ],
    stylePreset: {
      // Dark mode tech aesthetic
      darkMode: true,
      // Typography - modern and bold
      fontFamily: "Inter",
      titleFontSize: 32,
      subtitleFontSize: 16,
      segmentLabelFontSize: 14,
      periodLabelFontSize: 16,
      // Emphasize Cloud Services line
      emphasizedLines: [0], // Cloud Services is first
      // Line styling - bold and modern
      lineThickness: 3,
      // Custom colors - neon tech theme
      colorMode: "custom",
      userCustomColors: [
        "#06b6d4", // Cyan for Cloud (emphasized)
        "#ef4444", // Red for declining Software Licenses
        "#8b5cf6", // Purple for Consulting
        "#10b981", // Green for Support
        "#f59e0b", // Amber for Training
        "#6b7280", // Gray for declining Hardware
      ],
      // Axis styling - clean and minimal
      axisEnds: "both",
      slopeAxisLineColor: "#475569",
      slopeAxisLineWidth: 2,
      slopeAxisLineStyle: "solid",
      // Layout dimensions
      periodHeight: 400,
      chartWidth: 700,
      chartHeight: 500,
      canvasWidth: 1000,
      canvasHeight: 600,
    }
  },

  aiMarketBattle: {
    name: "AI Created - Market Share Shake-Up",
    description: "Styled data story: Smartphone competition winners and losers",
    title: "The Smartphone Wars",
    subtitle: "Chinese brands surge while Apple loses ground",
    data: [
      { Stage: "Apple", "2023": 28, "2024": 26 },
      { Stage: "Samsung", "2023": 24, "2024": 25 },
      { Stage: "Xiaomi", "2023": 14, "2024": 16 },
      { Stage: "OPPO", "2023": 11, "2024": 12 },
      { Stage: "Vivo", "2023": 9, "2024": 10 },
      { Stage: "Others", "2023": 14, "2024": 11 },
    ],
    stylePreset: {
      // Light mode for clarity
      darkMode: false,
      // Typography - bold and competitive
      fontFamily: "Inter",
      titleFontSize: 36,
      subtitleFontSize: 18,
      segmentLabelFontSize: 16,
      periodLabelFontSize: 18,
      // Emphasize Xiaomi (biggest winner)
      emphasizedLines: [2], // Xiaomi
      // Line styling - strong visual impact
      lineThickness: 3,
      // Custom colors - competitive brand colors
      colorMode: "custom",
      userCustomColors: [
        "#ef4444", // Red for Apple (losing)
        "#3b82f6", // Blue for Samsung
        "#f97316", // Orange for Xiaomi (emphasized winner)
        "#10b981", // Green for OPPO (growing)
        "#8b5cf6", // Purple for Vivo (growing)
        "#6b7280", // Gray for Others (declining)
      ],
      // Axis styling - bold and clear
      axisEnds: "both",
      slopeAxisLineColor: "#1f2937",
      slopeAxisLineWidth: 3,
      slopeAxisLineStyle: "solid",
      // Layout dimensions
      periodHeight: 450,
      chartWidth: 700,
      chartHeight: 520,
      canvasWidth: 1000,
      canvasHeight: 620,
    }
  },

  aiWebsiteWin: {
    name: "AI Created - Digital Transformation Win",
    description: "Styled data story: Dramatic website performance improvements",
    title: "Website Redesign Impact",
    subtitle: "Before and after: A performance breakthrough",
    data: [
      { Stage: "Page Load Time (s)", "Old Site": 4.2, "New Site": 1.8 },
      { Stage: "Bounce Rate (%)", "Old Site": 62, "New Site": 38 },
      { Stage: "Avg Session (min)", "Old Site": 2.4, "New Site": 4.7 },
      { Stage: "Pages per Session", "Old Site": 3.1, "New Site": 5.8 },
      { Stage: "Conversion Rate (%)", "Old Site": 2.3, "New Site": 4.9 },
      { Stage: "Mobile Traffic (%)", "Old Site": 42, "New Site": 68 },
    ],
    stylePreset: {
      // Light mode - clean and professional
      darkMode: false,
      // Typography - clean and modern
      fontFamily: "Inter",
      titleFontSize: 34,
      subtitleFontSize: 17,
      segmentLabelFontSize: 14,
      periodLabelFontSize: 16,
      // Emphasize conversion rate (biggest business impact)
      emphasizedLines: [4], // Conversion Rate
      // Line styling - smooth and professional
      lineThickness: 2.5,
      // Custom colors - improvement theme (green for good, red for bad to good)
      colorMode: "custom",
      userCustomColors: [
        "#10b981", // Green for Page Load (improvement - lower is better)
        "#10b981", // Green for Bounce Rate (improvement - lower is better)
        "#06b6d4", // Cyan for Avg Session (improvement)
        "#3b82f6", // Blue for Pages per Session (improvement)
        "#8b5cf6", // Purple for Conversion Rate (emphasized - major win)
        "#f59e0b", // Amber for Mobile Traffic (growth)
      ],
      // Axis styling - professional
      axisEnds: "both",
      slopeAxisLineColor: "#374151",
      slopeAxisLineWidth: 2,
      slopeAxisLineStyle: "solid",
      // Layout dimensions
      periodHeight: 480,
      chartWidth: 750,
      chartHeight: 540,
      canvasWidth: 1050,
      canvasHeight: 640,
    }
  },

  // Classic Tufte Slope Chart
  tufteSlope: {
    name: "Tufte Slope Chart",
    description: "Government receipts as % of GDP (1970-1979) - Classic Tufte visualization",
    chartType: "slope",
    title: "Current Receipts of Government",
    subtitle: "Percentage of Gross Domestic Product, 1970 and 1979",
    stylePreset: "/Examples/current-receipts-of-government-slope-style-2025-11-05.json",
    data: [
      { Stage: "Sweden", "1970": 46.9, "1979": 57.4 },
      { Stage: "Netherlands", "1970": 44.0, "1979": 55.8 },
      { Stage: "Norway", "1970": 43.5, "1979": 52.2 },
      { Stage: "Britain", "1970": 40.7, "1979": 39.0 },
      { Stage: "France", "1970": 39.0, "1979": 43.4 },
      { Stage: "Germany", "1970": 37.5, "1979": 42.9 },
      { Stage: "Belgium", "1970": 35.2, "1979": 43.2 },
      { Stage: "Canada", "1970": 35.2, "1979": 35.8 },
      { Stage: "Finland", "1970": 34.9, "1979": 38.2 },
      { Stage: "Italy", "1970": 30.4, "1979": 35.7 },
      { Stage: "United States", "1970": 30.3, "1979": 32.5 },
      { Stage: "Greece", "1970": 26.8, "1979": 30.6 },
      { Stage: "Switzerland", "1970": 26.5, "1979": 33.2 },
      { Stage: "Spain", "1970": 22.5, "1979": 27.1 },
      { Stage: "Japan", "1970": 20.7, "1979": 26.6 },
    ],
  },

  // Bar Chart datasets
  barSimple: {
    name: "Units Produced by Region",
    description: "Production units by regional location",
    title: "Regional Production Output",
    subtitle: "Manufacturing units produced by location - January 2024",
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
    title: "Q4 Sales by Region",
    subtitle: "Revenue performance across North American territories",
    stylePreset: "/Examples/q4-sales-by-region-bar-style-2025-11-04.json",
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
    title: "Marketing Channel ROI",
    subtitle: "Return on investment by acquisition channel",
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
    title: "Product Line Revenue",
    subtitle: "Annual revenue by product category - 2024",
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
    title: "Sales Team Performance",
    subtitle: "Individual contributor revenue achievements - Q4 2024",
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
    title: "Customer Acquisition Cost by Channel",
    subtitle: "Cost efficiency analysis across marketing channels",
    data: [
      { Category: "Google Ads", "Month 1": 450, "Month 2": 520, "Month 3": 580 },
      { Category: "Facebook Ads", "Month 1": 380, "Month 2": 420, "Month 3": 390 },
      { Category: "Content Marketing", "Month 1": 290, "Month 2": 340, "Month 3": 410 },
      { Category: "Partnerships", "Month 1": 180, "Month 2": 210, "Month 3": 245 },
      { Category: "Events", "Month 1": 120, "Month 2": 95, "Month 3": 145 },
    ],
  },

  // ==================== BAR CHART VARIANT DATASETS ====================

  barHorizontalSingle: {
    name: "Revenue by Quarter (Horizontal)",
    description: "Single-series horizontal bar chart - Quarterly revenue",
    chartType: "bar",
    title: "Quarterly Revenue Performance",
    subtitle: "Q1-Q4 2024 revenue in millions",
    data: [
      { Category: "Q1 2024", Revenue: 2450000 },
      { Category: "Q2 2024", Revenue: 2890000 },
      { Category: "Q3 2024", Revenue: 3120000 },
      { Category: "Q4 2024", Revenue: 3450000 },
    ],
    defaultSettings: {
      orientation: "horizontal",
      barMode: "grouped",
    },
  },

  barVerticalSingle: {
    name: "Top Products by Sales (Vertical)",
    description: "Single-series vertical bar chart - Product sales ranking",
    chartType: "bar",
    title: "Best Selling Products - 2024",
    subtitle: "Units sold by product category",
    data: [
      { Category: "Smartphones", Units: 45800 },
      { Category: "Laptops", Units: 32400 },
      { Category: "Tablets", Units: 28900 },
      { Category: "Smartwatches", Units: 19500 },
      { Category: "Headphones", Units: 15200 },
    ],
    defaultSettings: {
      orientation: "vertical",
      barMode: "grouped",
    },
  },

  barGroupedHorizontal: {
    name: "Sales by Region (Grouped Horizontal)",
    description: "Multi-series horizontal grouped bar chart",
    chartType: "bar",
    title: "Regional Sales Comparison",
    subtitle: "2023 vs 2024 sales performance by region",
    data: [
      { Category: "North America", "2023": 2450000, "2024": 2980000 },
      { Category: "Europe", "2023": 1890000, "2024": 2280000 },
      { Category: "Asia Pacific", "2023": 1560000, "2024": 2450000 },
      { Category: "Latin America", "2023": 980000, "2024": 1250000 },
      { Category: "Middle East", "2023": 720000, "2024": 950000 },
    ],
    defaultSettings: {
      orientation: "horizontal",
      barMode: "grouped",
    },
  },

  barGroupedVertical: {
    name: "Monthly Performance (Grouped Vertical)",
    description: "Multi-series vertical grouped bar chart",
    chartType: "bar",
    title: "Sales Team Performance Comparison",
    subtitle: "Q1 2024 monthly performance by team",
    data: [
      { Category: "January", "Team A": 145000, "Team B": 132000, "Team C": 118000 },
      { Category: "February", "Team A": 162000, "Team B": 149000, "Team C": 135000 },
      { Category: "March", "Team A": 178000, "Team B": 165000, "Team C": 152000 },
    ],
    defaultSettings: {
      orientation: "vertical",
      barMode: "grouped",
    },
  },

  // ==================== AREA CHART DATASETS ====================

  areaChartDefault: {
    name: "Marketing Channels (Area)",
    description: "Multi-series area chart with overlapping areas",
    chartType: "area",
    title: "Marketing Channel Traffic",
    subtitle: "Monthly visitors by acquisition channel - 2024",
    data: [
      { date: "2024-01-01", "Organic Search": 45000, "Paid Search": 32000, "Social Media": 28000, Email: 19000 },
      { date: "2024-02-01", "Organic Search": 48000, "Paid Search": 35000, "Social Media": 31000, Email: 21000 },
      { date: "2024-03-01", "Organic Search": 52000, "Paid Search": 38000, "Social Media": 34000, Email: 23000 },
      { date: "2024-04-01", "Organic Search": 55000, "Paid Search": 40000, "Social Media": 36000, Email: 25000 },
      { date: "2024-05-01", "Organic Search": 58000, "Paid Search": 42000, "Social Media": 38000, Email: 27000 },
      { date: "2024-06-01", "Organic Search": 61000, "Paid Search": 44000, "Social Media": 40000, Email: 29000 },
      { date: "2024-07-01", "Organic Search": 63000, "Paid Search": 45000, "Social Media": 41000, Email: 30000 },
      { date: "2024-08-01", "Organic Search": 66000, "Paid Search": 47000, "Social Media": 43000, Email: 32000 },
      { date: "2024-09-01", "Organic Search": 69000, "Paid Search": 49000, "Social Media": 45000, Email: 34000 },
      { date: "2024-10-01", "Organic Search": 72000, "Paid Search": 51000, "Social Media": 47000, Email: 36000 },
      { date: "2024-11-01", "Organic Search": 75000, "Paid Search": 53000, "Social Media": 49000, Email: 38000 },
      { date: "2024-12-01", "Organic Search": 78000, "Paid Search": 55000, "Social Media": 51000, Email: 40000 },
    ],
    metricNames: ["Organic Search", "Paid Search", "Social Media", "Email"],
    timeScale: "month",
    defaultSettings: {
      chartMode: "area",
      areaOpacity: 0.4,
      showAreaFill: true,
    },
  },

  areaStackedDefault: {
    name: "Product Revenue (Stacked Area)",
    description: "Stacked area chart showing cumulative values",
    chartType: "area-stacked",
    title: "Product Category Revenue Mix",
    subtitle: "Monthly revenue composition by product line - 2024",
    data: [
      { date: "2024-01-01", Electronics: 28500, Software: 19200, Services: 15800, Accessories: 8900 },
      { date: "2024-02-01", Electronics: 30200, Software: 20400, Services: 16900, Accessories: 9500 },
      { date: "2024-03-01", Electronics: 32800, Software: 22100, Services: 18200, Accessories: 10300 },
      { date: "2024-04-01", Electronics: 34500, Software: 23500, Services: 19100, Accessories: 10900 },
      { date: "2024-05-01", Electronics: 36200, Software: 24800, Services: 20000, Accessories: 11500 },
      { date: "2024-06-01", Electronics: 37900, Software: 26100, Services: 20900, Accessories: 12100 },
      { date: "2024-07-01", Electronics: 39100, Software: 27000, Services: 21500, Accessories: 12500 },
      { date: "2024-08-01", Electronics: 41200, Software: 28400, Services: 22600, Accessories: 13200 },
      { date: "2024-09-01", Electronics: 43500, Software: 29900, Services: 23800, Accessories: 13900 },
      { date: "2024-10-01", Electronics: 45800, Software: 31500, Services: 25100, Accessories: 14600 },
      { date: "2024-11-01", Electronics: 48100, Software: 33100, Services: 26400, Accessories: 15300 },
      { date: "2024-12-01", Electronics: 51200, Software: 35200, Services: 28100, Accessories: 16400 },
    ],
    metricNames: ["Electronics", "Software", "Services", "Accessories"],
    timeScale: "month",
    defaultSettings: {
      chartMode: "area-stacked",
      areaOpacity: 0.8,
      showAreaFill: true,
      stackAreas: true,
    },
  },

  // ==================== LINE CHART DATASETS ====================

  webTrafficYearly: {
    name: "Web Traffic (Yearly)",
    description: "Website metrics tracked annually from 2015-2024",
    chartType: "line",
    title: "Annual Website Performance",
    subtitle: "Yearly trends in visitors, page views, and conversions",
    data: [
      { date: "2015-01-01", Visitors: 12500, PageViews: 18900, Conversions: 4800 },
      { date: "2016-01-01", Visitors: 14800, PageViews: 23400, Conversions: 6200 },
      { date: "2017-01-01", Visitors: 17500, PageViews: 28900, Conversions: 8100 },
      { date: "2018-01-01", Visitors: 20300, PageViews: 35200, Conversions: 10500 },
      { date: "2019-01-01", Visitors: 23900, PageViews: 42100, Conversions: 13200 },
      { date: "2020-01-01", Visitors: 26800, PageViews: 48500, Conversions: 15800 },
      { date: "2021-01-01", Visitors: 31400, PageViews: 56200, Conversions: 19400 },
      { date: "2022-01-01", Visitors: 35800, PageViews: 63900, Conversions: 23100 },
      { date: "2023-01-01", Visitors: 40100, PageViews: 71500, Conversions: 27500 },
      { date: "2024-01-01", Visitors: 43900, PageViews: 78300, Conversions: 31200 },
    ],
    metricNames: ["Visitors", "PageViews", "Conversions"],
    timeScale: "year",
  },

  salesMonthly: {
    name: "Online Sales (Monthly)",
    description: "E-commerce revenue and orders tracked monthly for 2024",
    chartType: "line",
    title: "2024 Monthly Sales Performance",
    subtitle: "Revenue, orders, and customer count throughout the year",
    data: [
      { date: "2024-01-01", Revenue: 28500, Orders: 14200, Customers: 12400 },
      { date: "2024-02-01", Revenue: 29800, Orders: 15100, Customers: 13100 },
      { date: "2024-03-01", Revenue: 34200, Orders: 16800, Customers: 14500 },
      { date: "2024-04-01", Revenue: 36700, Orders: 17900, Customers: 15400 },
      { date: "2024-05-01", Revenue: 38900, Orders: 18500, Customers: 15900 },
      { date: "2024-06-01", Revenue: 41200, Orders: 19200, Customers: 16500 },
      { date: "2024-07-01", Revenue: 39800, Orders: 18700, Customers: 16100 },
      { date: "2024-08-01", Revenue: 42100, Orders: 19500, Customers: 16800 },
      { date: "2024-09-01", Revenue: 45600, Orders: 20800, Customers: 17900 },
      { date: "2024-10-01", Revenue: 48900, Orders: 22100, Customers: 19000 },
      { date: "2024-11-01", Revenue: 51200, Orders: 23400, Customers: 20100 },
      { date: "2024-12-01", Revenue: 58700, Orders: 26500, Customers: 22800 },
    ],
    metricNames: ["Revenue", "Orders", "Customers"],
    timeScale: "month",
  },

  patientOutcomesMonthly: {
    name: "Patient Outcomes (Monthly)",
    description: "Hospital metrics: admissions, treatments, and discharges",
    chartType: "line",
    title: "Patient Care Metrics - 2024",
    subtitle: "Monthly tracking of admissions, treatments, and discharges",
    data: [
      { date: "2024-01-01", Admissions: 12500, Treatments: 18900, Discharges: 11800 },
      { date: "2024-02-01", Admissions: 11800, Treatments: 17600, Discharges: 11100 },
      { date: "2024-03-01", Admissions: 13200, Treatments: 19500, Discharges: 12400 },
      { date: "2024-04-01", Admissions: 12800, Treatments: 19000, Discharges: 12100 },
      { date: "2024-05-01", Admissions: 12400, Treatments: 18300, Discharges: 11700 },
      { date: "2024-06-01", Admissions: 11900, Treatments: 17800, Discharges: 11300 },
      { date: "2024-07-01", Admissions: 12100, Treatments: 18100, Discharges: 11500 },
      { date: "2024-08-01", Admissions: 12300, Treatments: 18400, Discharges: 11700 },
      { date: "2024-09-01", Admissions: 12900, Treatments: 19200, Discharges: 12200 },
      { date: "2024-10-01", Admissions: 13400, Treatments: 19900, Discharges: 12700 },
      { date: "2024-11-01", Admissions: 13800, Treatments: 20500, Discharges: 13100 },
      { date: "2024-12-01", Admissions: 14200, Treatments: 21100, Discharges: 13500 },
    ],
    metricNames: ["Admissions", "Treatments", "Discharges"],
    timeScale: "month",
  },

  serverMetricsDaily: {
    name: "Server Performance (Daily)",
    description: "System metrics over 30 days: requests, sessions, and errors",
    chartType: "line",
    title: "Server Performance - Last 30 Days",
    subtitle: "Daily tracking of requests, active sessions, and error count",
    data: [
      { date: "2024-10-01", Requests: 14500, Sessions: 12300, Errors: 4500 },
      { date: "2024-10-02", Requests: 15200, Sessions: 12800, Errors: 4800 },
      { date: "2024-10-03", Requests: 15800, Sessions: 13200, Errors: 5200 },
      { date: "2024-10-04", Requests: 14900, Sessions: 12900, Errors: 4900 },
      { date: "2024-10-05", Requests: 13800, Sessions: 11800, Errors: 4300 },
      { date: "2024-10-06", Requests: 13200, Sessions: 11500, Errors: 4100 },
      { date: "2024-10-07", Requests: 14700, Sessions: 12400, Errors: 4700 },
      { date: "2024-10-08", Requests: 15600, Sessions: 13100, Errors: 5100 },
      { date: "2024-10-09", Requests: 16200, Sessions: 13700, Errors: 5400 },
      { date: "2024-10-10", Requests: 17100, Sessions: 14200, Errors: 5800 },
      { date: "2024-10-11", Requests: 17800, Sessions: 14800, Errors: 6200 },
      { date: "2024-10-12", Requests: 16900, Sessions: 14300, Errors: 5900 },
      { date: "2024-10-13", Requests: 15700, Sessions: 13500, Errors: 5300 },
      { date: "2024-10-14", Requests: 15100, Sessions: 13000, Errors: 5000 },
      { date: "2024-10-15", Requests: 16400, Sessions: 13800, Errors: 5500 },
      { date: "2024-10-16", Requests: 17300, Sessions: 14500, Errors: 6000 },
      { date: "2024-10-17", Requests: 18200, Sessions: 15100, Errors: 6300 },
      { date: "2024-10-18", Requests: 18900, Sessions: 15600, Errors: 6700 },
      { date: "2024-10-19", Requests: 18400, Sessions: 15300, Errors: 6500 },
      { date: "2024-10-20", Requests: 17500, Sessions: 14700, Errors: 6100 },
      { date: "2024-10-21", Requests: 16800, Sessions: 14100, Errors: 5800 },
      { date: "2024-10-22", Requests: 18000, Sessions: 15000, Errors: 6400 },
      { date: "2024-10-23", Requests: 19200, Sessions: 15800, Errors: 6800 },
      { date: "2024-10-24", Requests: 19800, Sessions: 16200, Errors: 7100 },
      { date: "2024-10-25", Requests: 20400, Sessions: 16700, Errors: 7300 },
      { date: "2024-10-26", Requests: 19500, Sessions: 16100, Errors: 6900 },
      { date: "2024-10-27", Requests: 18700, Sessions: 15500, Errors: 6600 },
      { date: "2024-10-28", Requests: 17900, Sessions: 14900, Errors: 6300 },
      { date: "2024-10-29", Requests: 19600, Sessions: 16300, Errors: 7000 },
      { date: "2024-10-30", Requests: 20700, Sessions: 16900, Errors: 7400 },
    ],
    metricNames: ["Requests", "Sessions", "Errors"],
    timeScale: "day",
  },

  stockPricesDaily: {
    name: "Product Sales (Daily)",
    description: "Product category sales tracked daily over Q4 2024",
    chartType: "line",
    title: "Product Sales Comparison - Q4 2024",
    subtitle: "Daily sales for major product categories",
    data: [
      { date: "2024-10-01", Electronics: 22750, Clothing: 41520, HomeGoods: 16380, Sports: 17830 },
      { date: "2024-10-02", Electronics: 22910, Clothing: 41780, HomeGoods: 16450, Sports: 17980 },
      { date: "2024-10-03", Electronics: 22830, Clothing: 41650, HomeGoods: 16390, Sports: 17890 },
      { date: "2024-10-04", Electronics: 23070, Clothing: 41920, HomeGoods: 16520, Sports: 18120 },
      { date: "2024-10-07", Electronics: 23210, Clothing: 42160, HomeGoods: 16610, Sports: 18250 },
      { date: "2024-10-08", Electronics: 23140, Clothing: 42030, HomeGoods: 16570, Sports: 18190 },
      { date: "2024-10-09", Electronics: 23380, Clothing: 42370, HomeGoods: 16730, Sports: 18380 },
      { date: "2024-10-10", Electronics: 23520, Clothing: 42590, HomeGoods: 16850, Sports: 18510 },
      { date: "2024-10-11", Electronics: 23460, Clothing: 42480, HomeGoods: 16790, Sports: 18440 },
      { date: "2024-10-14", Electronics: 23690, Clothing: 42740, HomeGoods: 16970, Sports: 18670 },
      { date: "2024-10-15", Electronics: 23810, Clothing: 42920, HomeGoods: 17080, Sports: 18790 },
      { date: "2024-10-16", Electronics: 23750, Clothing: 42810, HomeGoods: 17020, Sports: 18720 },
      { date: "2024-10-17", Electronics: 23980, Clothing: 43150, HomeGoods: 17210, Sports: 18950 },
      { date: "2024-10-18", Electronics: 24120, Clothing: 43380, HomeGoods: 17340, Sports: 19080 },
      { date: "2024-10-21", Electronics: 24050, Clothing: 43260, HomeGoods: 17270, Sports: 19010 },
      { date: "2024-10-22", Electronics: 24280, Clothing: 43590, HomeGoods: 17450, Sports: 19230 },
      { date: "2024-10-23", Electronics: 24410, Clothing: 43770, HomeGoods: 17580, Sports: 19360 },
      { date: "2024-10-24", Electronics: 24340, Clothing: 43640, HomeGoods: 17510, Sports: 19280 },
      { date: "2024-10-25", Electronics: 24570, Clothing: 43980, HomeGoods: 17720, Sports: 19510 },
      { date: "2024-10-28", Electronics: 24730, Clothing: 44210, HomeGoods: 17860, Sports: 19670 },
      { date: "2024-10-29", Electronics: 24650, Clothing: 44080, HomeGoods: 17790, Sports: 19590 },
      { date: "2024-10-30", Electronics: 24890, Clothing: 44420, HomeGoods: 18010, Sports: 19830 },
    ],
    metricNames: ["Electronics", "Clothing", "HomeGoods", "Sports"],
    timeScale: "day",
  },

  ecommerceDailyH1: {
    name: "E-commerce Sales (Daily H1 2024)",
    description: "Daily e-commerce metrics for first half of 2024 - ideal for time aggregation testing",
    chartType: "line",
    title: "E-commerce Performance - H1 2024",
    subtitle: "Daily revenue, orders, and conversion rate (Jan-Jun 2024)",
    data: generateDailySalesData('2024-01-01', 181), // 181 days = ~6 months
    metricNames: ["Revenue", "Orders", "ConversionRate"],
    timeScale: "day",
  },

  clothingRetail2Years: {
    name: "Online Clothing Retail (2 Years Daily)",
    description: "2 years of daily product category sales with Back to School and Holiday seasonality",
    chartType: "line",
    title: "Online Clothing Retail Sales",
    subtitle: "Daily sales by product category (2023-2024) with seasonal trends",
    data: generateClothingRetailData('2023-01-01', 730), // 730 days = 2 years
    metricNames: ["Shoes", "Shirts", "Pants", "Socks", "Accessories"],
    timeScale: "day",
  },

  marketingChannelRevenue: {
    name: "Marketing Channel Revenue",
    description: "Monthly revenue by marketing channel (2023-2024)",
    chartType: "line",
    title: "Marketing Channel Performance",
    subtitle: "Monthly revenue breakdown by acquisition channel",
    stylePreset: "/Examples/affiliate-revenue-disappeared-in-january-line-style-2025-11-05.json",
    data: [
      { date: "2023-01", Direct: 110941.87, "Paid Search": 89469.25, Email: 35787.7, Affiliate: 121678.18, Display: 0 },
      { date: "2023-02", Direct: 203948.69, "Paid Search": 164474.75, Email: 65789.9, Affiliate: 223685.66, Display: 0 },
      { date: "2023-03", Direct: 221891.49, "Paid Search": 178944.75, Email: 71577.9, Affiliate: 243364.86, Display: 0 },
      { date: "2023-04", Direct: 223896.57, "Paid Search": 180561.75, Email: 72224.7, Affiliate: 245563.98, Display: 0 },
      { date: "2023-05", Direct: 261945.97, "Paid Search": 211246.75, Email: 84498.7, Affiliate: 287295.58, Display: 0 },
      { date: "2023-06", Direct: 213197.85, "Paid Search": 171933.75, Email: 68773.5, Affiliate: 233829.9, Display: 0 },
      { date: "2023-07", Direct: 182258.92, "Paid Search": 146983, Email: 58793.2, Affiliate: 199896.88, Display: 0 },
      { date: "2023-08", Direct: 191420.97, "Paid Search": 154371.75, Email: 61748.7, Affiliate: 209945.58, Display: 0 },
      { date: "2023-09", Direct: 168130.67, "Paid Search": 135589.25, Email: 54235.7, Affiliate: 184401.38, Display: 0 },
      { date: "2023-10", Direct: 224625.38, "Paid Search": 181149.5, Email: 72459.8, Affiliate: 246363.32, Display: 0 },
      { date: "2023-11", Direct: 271497.69, "Paid Search": 218949.75, Email: 87579.9, Affiliate: 297771.66, Display: 0 },
      { date: "2023-12", Direct: 358018.07, "Paid Search": 288724.25, Email: 115489.7, Affiliate: 392664.98, Display: 0 },
      { date: "2024-01", Direct: 124541.196, "Paid Search": 103784.33, Email: 41513.732, Affiliate: 103784.33, Display: 41513.732 },
      { date: "2024-02", Direct: 36184.445, "Paid Search": 72368.89, Email: 14473.778, Affiliate: 0, Display: 21710.667 },
      { date: "2024-03", Direct: 50104.53, "Paid Search": 100209.06, Email: 20041.812, Affiliate: 0, Display: 30062.718 },
      { date: "2024-04", Direct: 63196.6125, "Paid Search": 126393.225, Email: 25278.645, Affiliate: 0, Display: 37917.9675 },
      { date: "2024-05", Direct: 80273.765, "Paid Search": 160547.53, Email: 32109.506, Affiliate: 0, Display: 48164.259 },
    ],
    metricNames: ["Direct", "Paid Search", "Email", "Affiliate", "Display"],
    timeScale: "month",
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
