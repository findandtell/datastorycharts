import { useState, useCallback, useEffect } from "react";
import Papa from "papaparse";
import { getSampleDataset, isComparisonDataset } from "../data/sampleDatasets";
import { parseCSV, csvToChartData, validateCSVStructure } from "../utils/csvUtils";
import { debug } from "../utils/debug";

/**
 * Get default dataset key based on chart type
 */
const getDefaultDatasetKey = (chartType) => {
  if (chartType === 'slope') return 'slopeRevenue';
  if (chartType === 'bar') return 'barSimple';
  if (chartType === 'line') return 'marketingChannelRevenue';
  return 'generic';
};

/**
 * Custom hook for managing chart data
 */
export const useChartData = (chartType = 'funnel') => {
  // Load default dataset based on chart type
  const defaultDatasetKey = getDefaultDatasetKey(chartType);
  const defaultDataset = getSampleDataset(defaultDatasetKey);
  const defaultChartData = defaultDataset?.data || null;

  // Extract default periods based on data structure
  let defaultPeriods = [];
  if (defaultChartData && defaultChartData.length > 0) {
    const isGroupedStacked = defaultChartData[0].hasOwnProperty('Group') && defaultChartData[0].hasOwnProperty('Period');
    if (isGroupedStacked) {
      defaultPeriods = [...new Set(defaultChartData.map(d => d.Period))];
    } else {
      // For Line charts, metrics are the keys excluding 'date'
      // For other charts, periods are the keys excluding 'Stage' or 'Category'
      defaultPeriods = Object.keys(defaultChartData[0]).filter((key) =>
        key !== "Stage" && key !== "Category" && key !== "date"
      );
    }
  }

  const [data, setData] = useState(defaultChartData);
  const [periodNames, setPeriodNames] = useState(defaultPeriods);
  const [editableData, setEditableData] = useState(defaultChartData ? structuredClone(defaultChartData) : []);
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [error, setError] = useState(null);
  const [hiddenPeriods, setHiddenPeriods] = useState(new Set());

  // Track raw data for Save/Load functionality
  const [rawCSV, setRawCSV] = useState('');
  const [source, setSource] = useState('sample'); // 'sample', 'csv-upload', 'csv-paste', 'google-sheets'
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState('');

  // Automatically filter hidden rows from chart data
  useEffect(() => {
    if (editableData && editableData.length > 0) {
      const visibleData = editableData.filter(row => !row.hidden);
      setData(structuredClone(visibleData));
    }
  }, [editableData]);

  /**
   * Detect if data is in flattened grouped-stacked format
   * Format: { Period: "Nov '18", "Group - Value": 21, ... }
   */
  const isFlattenedGroupedStacked = (data) => {
    if (data.length === 0) return false;
    const firstRow = data[0];

    // Must have "Period" column
    if (!firstRow.hasOwnProperty('Period')) return false;

    // Check if other columns follow "Group - Value" pattern
    const otherKeys = Object.keys(firstRow).filter(key => key !== 'Period');
    return otherKeys.some(key => key.includes(' - '));
  };

  /**
   * Transform flattened format to Group/Period format for chart rendering
   * From: { Period: "Nov '18", "All Voters - Very Well": 21, ... }
   * To: { Group: "All Voters", Period: "Nov '18", "Very Well": 21, ... }
   */
  const transformFlattenedToGroupPeriod = (data) => {
    const result = [];

    data.forEach(row => {
      const period = row.Period;
      const groupedData = {};

      // Parse each column to extract group and value column
      Object.keys(row).forEach(key => {
        if (key === 'Period') return;

        const parts = key.split(' - ');
        if (parts.length >= 2) {
          const group = parts[0];
          const valueColumn = parts.slice(1).join(' - '); // Handle cases like "Group - Sub - Value"

          if (!groupedData[group]) {
            groupedData[group] = { Group: group, Period: period };
          }
          groupedData[group][valueColumn] = row[key];
        }
      });

      // Add all group rows for this period
      Object.values(groupedData).forEach(groupRow => {
        result.push(groupRow);
      });
    });

    return result;
  };

  /**
   * Load sample dataset
   */
  const loadSampleData = useCallback((datasetKey) => {
    const dataset = getSampleDataset(datasetKey);
    if (!dataset) {
      setError("Sample dataset not found");
      return false;
    }

    let chartData = dataset.data;
    let editableData = structuredClone(chartData);
    let periods;

    // For line charts, use metricNames from the dataset
    if (dataset.metricNames) {
      periods = dataset.metricNames;
    } else {
      // Check if this is flattened grouped-stacked format
      const isFlattenedGS = isFlattenedGroupedStacked(chartData);

      if (isFlattenedGS) {
        // Extract periods from the Period column
        periods = chartData.map(d => d.Period);

        // Transform to Group/Period format for chart rendering
        chartData = transformFlattenedToGroupPeriod(chartData);

        // Keep flattened format for editing (Datawrapper style!)
        editableData = structuredClone(dataset.data);
      } else {
        // For regular format, filter out Stage/Category columns
        periods = Object.keys(chartData[0]).filter((key) => key !== "Stage" && key !== "Category");
      }
    }

    setData(chartData);
    setPeriodNames(periods);
    setEditableData(editableData);
    setIsComparisonMode(isComparisonDataset(datasetKey));
    setError(null);

    // Convert sample data to CSV for Save/Load functionality
    // Use the original dataset.data structure for CSV conversion
    const csvRows = [];
    const sampleData = dataset.data;
    if (sampleData && sampleData.length > 0) {
      // Get headers from first row
      const headers = Object.keys(sampleData[0]);
      csvRows.push(headers.join(','));

      // Add data rows
      sampleData.forEach(row => {
        const values = headers.map(header => {
          const value = row[header];
          // Escape values that contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        });
        csvRows.push(values.join(','));
      });
    }
    setRawCSV(csvRows.join('\n'));
    setSource('sample');

    return true;
  }, []);

  /**
   * Load CSV file
   */
  const loadCSVFile = useCallback(async (file) => {
    try {
      // Read file content as text for storage
      const fileText = await file.text();

      const results = await parseCSV(file);

      if (results.errors && results.errors.length > 0) {
        setError("Error parsing CSV: " + results.errors[0].message);
        return false;
      }

      // Use meta.fields to preserve original column order (important for numeric column names)
      const fieldOrder = results.meta?.fields;

      const validation = validateCSVStructure(results.data, fieldOrder);
      if (!validation.valid) {
        setError("Invalid CSV structure: " + validation.errors.join(", "));
        return false;
      }

      // Determine the field name based on chart type
      const isLineChart = chartType === 'line' || chartType === 'area' || chartType === 'area-stacked';
      const isBarChart = chartType?.startsWith('bar-');
      const stageFieldName = isLineChart ? 'date' : (isBarChart ? 'Category' : 'Stage');
      const { data: chartData, periods } = csvToChartData(results.data, fieldOrder, stageFieldName);

      setData(chartData);
      setPeriodNames(periods);
      setEditableData(structuredClone(chartData));
      setIsComparisonMode(false);
      setError(null);

      // Track raw CSV for Save/Load
      setRawCSV(fileText);
      setSource('csv-upload');

      return true;
    } catch (err) {
      setError("Failed to load CSV: " + err.message);
      return false;
    }
  }, [chartType]);

  /**
   * Load CSV from text string (for copy/paste functionality)
   */
  const loadCSVText = useCallback(async (csvText, delimiter = ',', source = 'csv-paste') => {
    try {
      const Papa = (await import('papaparse')).default;

      // If space-delimited, convert to tab-delimited for better parsing
      let processedText = csvText;
      if (delimiter instanceof RegExp) {
        processedText = csvText.split('\n').map(line =>
          line.trim().replace(/\s{2,}/g, '\t')
        ).join('\n');
        delimiter = '\t';
      }

      const results = Papa.parse(processedText, {
        header: true,
        delimiter: delimiter,
        dynamicTyping: true,
        skipEmptyLines: true
      });

      if (results.errors && results.errors.length > 0) {
        setError("Error parsing CSV: " + results.errors[0].message);
        return false;
      }

      if (!results.data || results.data.length === 0) {
        setError("No data found in CSV");
        return false;
      }

      // Use meta.fields to preserve original column order
      const fieldOrder = results.meta?.fields || Object.keys(results.data[0]);

      const validation = validateCSVStructure(results.data, fieldOrder);
      if (!validation.valid) {
        setError("Invalid CSV structure: " + validation.errors.join(", "));
        return false;
      }

      // Determine the field name based on chart type
      const isLineChart = chartType === 'line' || chartType === 'area' || chartType === 'area-stacked';
      const isBarChart = chartType?.startsWith('bar-');
      const stageFieldName = isLineChart ? 'date' : (isBarChart ? 'Category' : 'Stage');
      const { data: chartData, periods } = csvToChartData(results.data, fieldOrder, stageFieldName);

      setData(chartData);
      setPeriodNames(periods);
      setEditableData(structuredClone(chartData));
      setIsComparisonMode(false);
      setError(null);

      // Track raw CSV for Save/Load
      setRawCSV(csvText);
      setSource(source);

      return true;
    } catch (err) {
      setError("Failed to load CSV text: " + err.message);
      return false;
    }
  }, [chartType]);

  /**
   * Update data value
   */
  const updateDataValue = useCallback((stageIndex, periodKey, value) => {
    setEditableData((prev) => {
      const updated = [...prev];
      updated[stageIndex] = {
        ...updated[stageIndex],
        [periodKey]: value,
      };
      return updated;
    });
  }, []);

  /**
   * Update stage name
   */
  const updateStageName = useCallback((stageIndex, newName, fieldName = 'Stage') => {
    setEditableData((prev) => {
      const updated = [...prev];
      updated[stageIndex] = {
        ...updated[stageIndex],
        [fieldName]: newName,
      };
      return updated;
    });
  }, []);

  /**
   * Toggle stage hidden property
   */
  const toggleStageHidden = useCallback((stageIndex, hidden) => {
    setEditableData((prev) => {
      const updated = [...prev];
      updated[stageIndex] = {
        ...updated[stageIndex],
        hidden: hidden,
      };
      return updated;
    });
  }, []);

  /**
   * Toggle period/metric column visibility
   */
  const togglePeriodHidden = useCallback((periodName, hidden) => {
    setHiddenPeriods((prev) => {
      const updated = new Set(prev);
      if (hidden) {
        updated.add(periodName);
      } else {
        updated.delete(periodName);
      }
      return updated;
    });
  }, []);

  /**
   * Update period name
   */
  const updatePeriodName = useCallback((oldName, newName) => {
    setPeriodNames((prev) => prev.map((name) => (name === oldName ? newName : name)));

    setEditableData((prev) =>
      prev.map((row) => {
        const { [oldName]: value, ...rest } = row;
        return { ...rest, [newName]: value };
      })
    );

    // Update hiddenPeriods if the old name was hidden
    setHiddenPeriods((prev) => {
      if (prev.has(oldName)) {
        const updated = new Set(prev);
        updated.delete(oldName);
        updated.add(newName);
        return updated;
      }
      return prev;
    });
  }, []);

  /**
   * Add new column/period
   */
  const addPeriod = useCallback((periodName) => {
    if (!periodName || periodNames.includes(periodName)) {
      return false;
    }

    setPeriodNames((prev) => [...prev, periodName]);
    
    setEditableData((prev) =>
      prev.map((row) => ({
        ...row,
        [periodName]: 0,
      }))
    );

    return true;
  }, [periodNames]);

  /**
   * Remove column/period
   */
  const removePeriod = useCallback((periodName) => {
    if (periodNames.length <= 1) {
      setError("Cannot remove the last period");
      return false;
    }

    setPeriodNames((prev) => prev.filter((name) => name !== periodName));

    setEditableData((prev) =>
      prev.map((row) => {
        const { [periodName]: _, ...rest } = row;
        return rest;
      })
    );

    // Remove from hiddenPeriods if it was hidden
    setHiddenPeriods((prev) => {
      if (prev.has(periodName)) {
        const updated = new Set(prev);
        updated.delete(periodName);
        return updated;
      }
      return prev;
    });

    return true;
  }, [periodNames]);

  /**
   * Add new stage/row
   */
  const addStage = useCallback((stageName, fieldName = 'Stage') => {
    if (!stageName) return false;

    const newRow = { [fieldName]: stageName };
    periodNames.forEach((period) => {
      newRow[period] = 0;
    });

    setEditableData((prev) => [...prev, newRow]);
    return true;
  }, [periodNames]);

  /**
   * Remove stage/row
   */
  const removeStage = useCallback((stageIndex) => {
    if (editableData.length <= 2) {
      setError("Cannot have fewer than 2 stages");
      return false;
    }

    setEditableData((prev) => prev.filter((_, index) => index !== stageIndex));
    return true;
  }, [editableData]);

  /**
   * Reorder columns
   */
  const reorderPeriods = useCallback((fromIndex, toIndex) => {
    setPeriodNames((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  }, []);

  /**
   * Set period order from an array of period names
   */
  const setPeriodOrder = useCallback((newOrder) => {
    setPeriodNames(newOrder);
  }, []);

  /**
   * Toggle comparison mode
   */
  const toggleComparisonMode = useCallback(() => {
    setIsComparisonMode((prev) => !prev);
  }, []);

  /**
   * Transpose data - swap rows and columns
   */
  const transposeData = useCallback(() => {
    if (!editableData || editableData.length === 0) return;

    const firstRow = editableData[0];
    const categoryField = Object.keys(firstRow).find(
      key => key === 'Category' || key === 'Stage' || key === 'date'
    );

    if (!categoryField) return;

    // Get all period/column names (excluding category field and hidden)
    const periods = Object.keys(firstRow).filter(
      key => key !== categoryField && key !== 'hidden' && key !== '_id'
    );

    // Build transposed data
    const transposedData = periods.map(period => {
      const newRow = { [categoryField]: period };

      editableData.forEach(row => {
        const categoryValue = row[categoryField];
        newRow[categoryValue] = row[period];
      });

      return newRow;
    });

    // Update period names to the old category values
    const newPeriodNames = editableData.map(row => row[categoryField]);

    // Update both editableData and periodNames
    setEditableData(transposedData);
    setPeriodNames(newPeriodNames);
  }, [editableData]);

  /**
   * Apply edited data to main data (filtering out hidden rows)
   */
  const applyEdits = useCallback(() => {
    // Filter out rows where hidden is true
    const visibleData = editableData.filter(row => !row.hidden);
    setData(structuredClone(visibleData));

    // Regenerate CSV from current data so it's saved correctly to Figma
    // Remove internal fields like 'hidden' and '_id' before converting to CSV
    const cleanedData = visibleData.map(row => {
      const { hidden, _id, ...cleanRow } = row;
      return cleanRow;
    });

    // Convert data back to CSV format
    const csvString = Papa.unparse(cleanedData);
    setRawCSV(csvString);
    debug.log('ChartData', 'Regenerated CSV from current data');
  }, [editableData]);

  /**
   * Reset edits
   */
  const resetEdits = useCallback(() => {
    setEditableData(structuredClone(data));
  }, [data]);

  /**
   * Clear all data
   */
  const clearData = useCallback(() => {
    setData(null);
    setPeriodNames([]);
    setEditableData([]);
    setIsComparisonMode(false);
    setError(null);
  }, []);

  /**
   * Get data for a specific period
   */
  const getPeriodData = useCallback((periodName) => {
    if (!data) return [];
    return data.map((row) => ({
      stage: row.Stage || row.Category,
      value: row[periodName] || 0,
    }));
  }, [data]);

  /**
   * Get data for a specific stage
   */
  const getStageData = useCallback((stageName) => {
    if (!data) return [];
    const row = data.find((r) => r.Stage === stageName || r.Category === stageName);
    if (!row) return [];

    return periodNames.map((period) => ({
      period,
      value: row[period] || 0,
    }));
  }, [data, periodNames]);

  /**
   * Sort stages by value in a specific period
   */
  const sortByPeriod = useCallback((periodName, ascending = false) => {
    setEditableData((prev) => {
      const sorted = [...prev].sort((a, b) => {
        const valueA = a[periodName] || 0;
        const valueB = b[periodName] || 0;
        return ascending ? valueA - valueB : valueB - valueA;
      });
      return sorted;
    });
  }, []);

  /**
   * Reorder stages (for drag and drop)
   */
  const reorderStages = useCallback((fromIndex, toIndex) => {
    setEditableData((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  }, []);

  /**
   * Load snapshot data (for snapshot restoration)
   */
  const loadSnapshotData = useCallback((snapshotData, snapshotPeriods, snapshotIsComparison = false) => {
    if (!snapshotData || !snapshotPeriods) {
      setError("Invalid snapshot data");
      return false;
    }

    setData(snapshotData);
    setPeriodNames(snapshotPeriods);
    setEditableData(structuredClone(snapshotData));
    setIsComparisonMode(snapshotIsComparison);
    setError(null);

    return true;
  }, []);

  return {
    // State
    data,
    periodNames,
    editableData,
    isComparisonMode,
    error,
    hiddenPeriods,

    // Save/Load state
    rawCSV,
    source,
    googleSheetsUrl,
    setGoogleSheetsUrl,

    // Actions
    loadSampleData,
    loadCSVFile,
    loadCSVText,
    loadSnapshotData,
    updateDataValue,
    updateStageName,
    toggleStageHidden,
    togglePeriodHidden,
    updatePeriodName,
    addPeriod,
    removePeriod,
    addStage,
    removeStage,
    reorderPeriods,
    setPeriodOrder,
    reorderStages,
    sortByPeriod,
    toggleComparisonMode,
    transposeData,
    applyEdits,
    resetEdits,
    clearData,
    setHiddenPeriods,

    // Getters
    getPeriodData,
    getStageData,

    // Computed
    hasData: data !== null && data.length > 0,
    stageCount: data?.length || 0,
    periodCount: periodNames.length,
  };
};

export default useChartData;
