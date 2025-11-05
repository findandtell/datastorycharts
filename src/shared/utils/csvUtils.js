/**
 * CSV utilities for parsing and validation
 */

import Papa from "papaparse";

/**
 * Parse CSV file
 */
export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: false, // Changed to false to preserve column order with numeric headers
      skipEmptyLines: true,
      complete: (results) => {
        // Remove BOM from field names if present
        const cleanedFields = results.meta.fields.map(field =>
          field.replace(/^\uFEFF/, '') // Remove UTF-8 BOM
        );

        // Manually convert numeric values after parsing to avoid column ordering issues
        const data = results.data.map(row => {
          const converted = {};
          results.meta.fields.forEach((field, index) => {
            const cleanField = cleanedFields[index];
            let value = row[field];

            // Clean up value: trim whitespace and remove thousand separator commas
            if (typeof value === 'string') {
              value = value.trim();
              // Remove commas (thousand separators) from numeric strings
              const cleanedValue = value.replace(/,/g, '');
              // Convert to number if it looks like a number after cleaning
              converted[cleanField] = (cleanedValue !== '' && !isNaN(cleanedValue))
                ? Number(cleanedValue)
                : value; // Keep original if not a number
            } else {
              // Convert to number if it looks like a number
              converted[cleanField] = (value !== null && value !== undefined && value !== '' && !isNaN(value))
                ? Number(value)
                : value;
            }
          });
          return converted;
        });

        resolve({
          ...results,
          data,
          meta: {
            ...results.meta,
            fields: cleanedFields, // Use cleaned field names
          }
        });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

/**
 * Convert month names to dates
 * Handles: Jan, Feb, January, February, 1, 2, etc.
 */
const convertMonthToDate = (value, year = new Date().getFullYear()) => {
  if (!value) return value;

  const monthMap = {
    'jan': 0, 'january': 0,
    'feb': 1, 'february': 1,
    'mar': 2, 'march': 2,
    'apr': 3, 'april': 3,
    'may': 4,
    'jun': 5, 'june': 5,
    'jul': 6, 'july': 6,
    'aug': 7, 'august': 7,
    'sep': 8, 'september': 8,
    'oct': 9, 'october': 9,
    'nov': 10, 'november': 10,
    'dec': 11, 'december': 11
  };

  const str = String(value).toLowerCase().trim();

  // Check if it's a month name
  if (monthMap.hasOwnProperty(str)) {
    const date = new Date(year, monthMap[str], 1);
    return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  }

  // Check if it's a month number (1-12)
  const num = parseInt(str);
  if (!isNaN(num) && num >= 1 && num <= 12) {
    const date = new Date(year, num - 1, 1);
    return date.toISOString().split('T')[0];
  }

  // Return original value if not a month
  return value;
};

/**
 * Convert CSV data to chart format
 */
export const csvToChartData = (csvData, fieldOrder = null, stageFieldName = 'Stage') => {
  if (!csvData || csvData.length === 0) {
    return { data: [], periods: [] };
  }

  // Get column names (excluding the first column which is assumed to be stages)
  // Use provided fieldOrder to preserve original column order (important for numeric column names)
  const columns = fieldOrder || Object.keys(csvData[0]);
  const stageColumn = columns[0];
  const periodColumns = columns.slice(1);

  // Auto-detect if we need to convert months to dates
  const isDateField = stageFieldName === 'date';
  const needsMonthConversion = isDateField && csvData.length > 0 &&
    /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december|\d{1,2})$/i
    .test(String(csvData[0][stageColumn]).trim());

  // Transform data
  const data = csvData.map((row) => {
    let stageValue = row[stageColumn];

    // Convert month to date if needed
    if (needsMonthConversion) {
      stageValue = convertMonthToDate(stageValue);
    }

    const stage = { [stageFieldName]: stageValue };
    periodColumns.forEach((col) => {
      stage[col] = Number(row[col]) || 0;
    });
    return stage;
  });

  return {
    data,
    periods: periodColumns,
  };
};

/**
 * Validate CSV structure for funnel chart
 */
export const validateCSVStructure = (csvData, fieldOrder = null) => {
  const errors = [];

  if (!csvData || csvData.length === 0) {
    errors.push("CSV file is empty");
    return { valid: false, errors };
  }

  if (csvData.length < 2) {
    errors.push("CSV must contain at least 2 stages");
  }

  // Use provided fieldOrder to preserve original column order (important for numeric column names)
  const columns = fieldOrder || Object.keys(csvData[0]);
  if (columns.length < 2) {
    errors.push("CSV must contain at least one stage column and one period column");
  }

  // Check if numeric columns contain valid numbers
  const periodColumns = columns.slice(1);
  csvData.forEach((row, index) => {
    periodColumns.forEach((col) => {
      const value = row[col];
      if (value !== null && value !== undefined && isNaN(Number(value))) {
        errors.push(`Row ${index + 1}, Column "${col}": Invalid number value "${value}"`);
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings: [],
  };
};

/**
 * Check if data follows funnel pattern (generally decreasing)
 */
export const checkFunnelPattern = (data) => {
  const warnings = [];
  
  if (!data || data.length === 0) return warnings;

  const columns = Object.keys(data[0]).slice(1); // Skip Stage column
  
  columns.forEach((col) => {
    let increasing = 0;
    for (let i = 1; i < data.length; i++) {
      if (data[i][col] > data[i - 1][col]) {
        increasing++;
      }
    }
    
    if (increasing > data.length / 2) {
      warnings.push(`Column "${col}" shows increasing pattern - not typical for a funnel`);
    }
  });

  return warnings;
};

/**
 * Export data to CSV format
 */
export const exportToCSV = (data, filename = "chart-data.csv") => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Clean and normalize CSV data
 */
export const cleanCSVData = (data) => {
  return data.map((row) => {
    const cleaned = {};
    Object.keys(row).forEach((key) => {
      let value = row[key];
      // Remove any leading/trailing whitespace from keys
      const cleanKey = key.trim();

      // Clean and convert numeric strings to numbers
      if (typeof value === "string") {
        value = value.trim();
        // Remove commas (thousand separators) from numeric strings
        const cleanedValue = value.replace(/,/g, '');
        cleaned[cleanKey] = (cleanedValue !== '' && !isNaN(cleanedValue))
          ? Number(cleanedValue)
          : value; // Keep original if not a number
      } else {
        cleaned[cleanKey] = value;
      }
    });
    return cleaned;
  });
};

/**
 * Get summary statistics from CSV data
 */
export const getCSVSummary = (data) => {
  if (!data || data.length === 0) {
    return null;
  }

  const columns = Object.keys(data[0]);
  const stageColumn = columns[0];
  const periodColumns = columns.slice(1);

  const summary = {
    totalStages: data.length,
    totalPeriods: periodColumns.length,
    columns: columns,
    stageNames: data.map((row) => row[stageColumn]),
    periodNames: periodColumns,
  };

  return summary;
};
