import { useState, useCallback } from "react";
import { getSampleDataset, isComparisonDataset } from "../data/sampleDatasets";
import { parseCSV, csvToChartData, validateCSVStructure } from "../utils/csvUtils";

/**
 * Get default dataset key based on chart type
 */
const getDefaultDatasetKey = (chartType) => {
  if (chartType === 'slope') return 'slopeRevenue';
  if (chartType === 'bar') return 'barSimple';
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
  const defaultPeriods = defaultChartData ? Object.keys(defaultChartData[0]).filter((key) => key !== "Stage" && key !== "Category") : [];

  const [data, setData] = useState(defaultChartData);
  const [periodNames, setPeriodNames] = useState(defaultPeriods);
  const [editableData, setEditableData] = useState(defaultChartData ? JSON.parse(JSON.stringify(defaultChartData)) : []);
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load sample dataset
   */
  const loadSampleData = useCallback((datasetKey) => {
    const dataset = getSampleDataset(datasetKey);
    if (!dataset) {
      setError("Sample dataset not found");
      return false;
    }

    const chartData = dataset.data;
    const periods = Object.keys(chartData[0]).filter((key) => key !== "Stage" && key !== "Category");

    setData(chartData);
    setPeriodNames(periods);
    setEditableData(JSON.parse(JSON.stringify(chartData)));
    setIsComparisonMode(isComparisonDataset(datasetKey));
    setError(null);

    return true;
  }, []);

  /**
   * Load CSV file
   */
  const loadCSVFile = useCallback(async (file) => {
    try {
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
      const stageFieldName = chartType === 'bar' ? 'Category' : 'Stage';
      const { data: chartData, periods } = csvToChartData(results.data, fieldOrder, stageFieldName);

      setData(chartData);
      setPeriodNames(periods);
      setEditableData(JSON.parse(JSON.stringify(chartData)));
      setIsComparisonMode(false);
      setError(null);

      return true;
    } catch (err) {
      setError("Failed to load CSV: " + err.message);
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
   * Toggle comparison mode
   */
  const toggleComparisonMode = useCallback(() => {
    setIsComparisonMode((prev) => !prev);
  }, []);

  /**
   * Apply edited data to main data (filtering out hidden rows)
   */
  const applyEdits = useCallback(() => {
    // Filter out rows where hidden is true
    const visibleData = editableData.filter(row => !row.hidden);
    setData(JSON.parse(JSON.stringify(visibleData)));
  }, [editableData]);

  /**
   * Reset edits
   */
  const resetEdits = useCallback(() => {
    setEditableData(JSON.parse(JSON.stringify(data)));
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

  return {
    // State
    data,
    periodNames,
    editableData,
    isComparisonMode,
    error,

    // Actions
    loadSampleData,
    loadCSVFile,
    updateDataValue,
    updateStageName,
    toggleStageHidden,
    updatePeriodName,
    addPeriod,
    removePeriod,
    addStage,
    removeStage,
    reorderPeriods,
    reorderStages,
    sortByPeriod,
    toggleComparisonMode,
    applyEdits,
    resetEdits,
    clearData,

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
