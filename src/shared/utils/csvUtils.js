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
        // Manually convert numeric values after parsing to avoid column ordering issues
        const data = results.data.map(row => {
          const converted = {};
          results.meta.fields.forEach(field => {
            const value = row[field];
            // Convert to number if it looks like a number
            converted[field] = (value !== null && value !== undefined && value !== '' && !isNaN(value))
              ? Number(value)
              : value;
          });
          return converted;
        });

        resolve({
          ...results,
          data,
          meta: {
            ...results.meta,
            fields: results.meta.fields, // Preserve original field order
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
 * Convert CSV data to chart format
 */
export const csvToChartData = (csvData, fieldOrder = null) => {
  if (!csvData || csvData.length === 0) {
    return { data: [], periods: [] };
  }

  // Get column names (excluding the first column which is assumed to be stages)
  // Use provided fieldOrder to preserve original column order (important for numeric column names)
  const columns = fieldOrder || Object.keys(csvData[0]);
  const stageColumn = columns[0];
  const periodColumns = columns.slice(1);

  // Transform data
  const data = csvData.map((row) => {
    const stage = { Stage: row[stageColumn] };
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
      const value = row[key];
      // Remove any leading/trailing whitespace from keys
      const cleanKey = key.trim();
      // Convert numeric strings to numbers
      cleaned[cleanKey] = typeof value === "string" && !isNaN(value) 
        ? Number(value) 
        : value;
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
