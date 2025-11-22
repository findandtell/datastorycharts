import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Register all AG Grid Community modules
ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * Spreadsheet-style Data Table using AG Grid
 * Provides Excel-like editing experience with copy/paste support
 */
function SpreadsheetDataTable({ chartData, chartType, onClose }) {
  const gridRef = useRef();
  const [newColumnName, setNewColumnName] = useState('');
  const [newRowName, setNewRowName] = useState('');

  // Track focused cell for copy/paste
  const [focusedCell, setFocusedCell] = useState({
    rowIndex: null,
    colId: null
  });

  // Detect chart type labels
  const isBarChart = chartType?.startsWith('bar-');
  const isLineChart = chartType === 'line' || chartType === 'area' || chartType === 'area-stacked';
  const rowLabel = isLineChart ? 'Date' : (isBarChart ? 'Category' : 'Stage');
  const colLabel = isLineChart ? 'Metric' : (isBarChart ? 'Value' : 'Period');

  // Convert chartData to AG Grid format
  const rowData = useMemo(() => {
    return chartData.editableData.map((row, index) => ({
      _id: index, // Internal ID for row tracking
      ...row
    }));
  }, [chartData.editableData]);

  // Helper function to convert column index to Excel letter (0=A, 1=B, etc.)
  const getColumnLetter = (index) => {
    let letter = '';
    while (index >= 0) {
      letter = String.fromCharCode((index % 26) + 65) + letter;
      index = Math.floor(index / 26) - 1;
    }
    return letter;
  };

  // Create a serialized version of hiddenPeriods for dependency tracking
  const hiddenPeriodsKey = useMemo(() => {
    return Array.from(chartData.hiddenPeriods || []).sort().join(',');
  }, [chartData.hiddenPeriods]);

  // Define columns
  const columnDefs = useMemo(() => {
    if (!chartData.editableData || chartData.editableData.length === 0) return [];

    const firstRow = chartData.editableData[0];
    const allFields = Object.keys(firstRow).filter(f => f !== 'hidden');

    // Build fields array: Category/Stage/date first, then use periodNames order
    const categoryField = allFields.find(f => f === 'Category' || f === 'Stage' || f === 'date');
    const periodFields = chartData.periodNames || [];

    // Combine: category field + period fields in user's desired order
    const fields = categoryField
      ? [categoryField, ...periodFields]
      : periodFields;

    // Add checkbox column at the beginning
    const checkboxColumn = {
      headerName: '',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 40,
      maxWidth: 40,
      pinned: 'left',
      lockPosition: true,
      suppressMenu: true,
      filter: false,
      sortable: false,
      resizable: false,
    };

    const dataColumns = fields.map((field, index) => {
      const isCategory = field === 'Category' || field === 'Stage' || field === 'date';
      const isDate = field === 'date';
      const isStage = field === 'Stage';
      const columnLetter = getColumnLetter(index);

      // Determine what controls should be available
      const allowSort = !isDate && !isStage; // No sorting for date or Stage columns
      const allowHide = !isCategory; // Cannot hide essential columns
      const allowDelete = !isCategory; // Cannot delete essential columns
      const allowDrag = !isCategory; // Cannot drag essential columns

      // Create a column group with letter header at top
      const isHidden = chartData.hiddenPeriods?.has(field) || false;
      return {
        headerName: columnLetter,
        headerGroupComponent: ColumnLetterHeader,
        headerGroupComponentParams: {
          letter: columnLetter,
          onDelete: allowDelete ? () => handleColumnDelete(field) : null,
          onHide: allowHide ? () => handleColumnHide(field) : null,
          onSort: allowSort ? (ascending) => handleColumnSort(field, ascending) : null,
          isCategory: isCategory,
          isHidden: isHidden,
          allowSort,
          allowHide,
          allowDelete,
        },
        // Lock essential columns in place
        lockPosition: !allowDrag,
        suppressMovable: !allowDrag,
        children: [
          {
            field: field,
            headerName: field,
            editable: true,
            sortable: true,
            resizable: true,
            filter: true,
            cellClass: isCategory ? 'bg-gray-50 font-medium' : '',
            minWidth: 120,
            // Apply grey styling for hidden columns AND hidden rows
            cellStyle: (params) => {
              // Check if column is hidden (need to check dynamically, not from closure)
              const isColumnHidden = chartData.hiddenPeriods?.has(field) || false;
              // Check if row is hidden
              const isRowHidden = params.data?.hidden === true;

              // Apply styling if either column or row is hidden
              if (isColumnHidden || isRowHidden) {
                return { backgroundColor: '#d1d5db', opacity: 0.7, fontStyle: 'italic' };
              }
              return null;
            },
            // Enable copy/paste
            valueParser: (params) => {
              // Try to parse as number for numeric columns
              if (!isCategory && params.newValue) {
                const num = parseFloat(params.newValue);
                return isNaN(num) ? params.newValue : num;
              }
              return params.newValue;
            },
            // Custom header component for editable column name
            headerComponent: EditableColumnName,
            headerComponentParams: {
              onRename: (newName) => handleColumnRename(field, newName),
              columnName: field,
              isCategory: isCategory,
              isHidden: isHidden,
            }
          }
        ]
      };
    });

    // Return checkbox column + data columns
    return [checkboxColumn, ...dataColumns];
  }, [chartData.editableData, chartData, chartData.periodNames, hiddenPeriodsKey]);

  // Handle cell value change
  const onCellValueChanged = useCallback((event) => {
    const { data, colDef, newValue } = event;
    const rowIndex = data._id;
    const columnName = colDef.field;

    // Update the data through chartData hook
    chartData.updateDataValue(rowIndex, columnName, newValue);
  }, [chartData]);

  // Handle column rename
  const handleColumnRename = (oldName, newName) => {
    if (newName && newName !== oldName) {
      chartData.updatePeriodName(oldName, newName);
    }
  };

  // Handle column delete
  const handleColumnDelete = (columnName) => {
    if (confirm(`Delete column "${columnName}"?`)) {
      chartData.removePeriod(columnName);
    }
  };

  // Handle column hide/unhide toggle
  const handleColumnHide = (columnName) => {
    const isCurrentlyHidden = chartData.hiddenPeriods?.has(columnName) || false;
    chartData.togglePeriodHidden(columnName, !isCurrentlyHidden);

    // Force immediate refresh of all cells to update styling
    setTimeout(() => {
      if (gridRef.current && gridRef.current.api) {
        // Redraw all rows to force style recalculation
        gridRef.current.api.redrawRows();
        gridRef.current.api.refreshHeader();
      }
    }, 10);
  };

  // Handle column sort
  const handleColumnSort = (columnName, ascending) => {
    chartData.sortByPeriod(columnName, ascending);
  };

  // Handle add new column
  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      chartData.addPeriod(newColumnName.trim());
      setNewColumnName('');
    }
  };

  // Handle add new row
  const handleAddRow = () => {
    if (newRowName.trim()) {
      const stageFieldName = isLineChart ? 'date' : (isBarChart ? 'Category' : 'Stage');
      chartData.addStage(newRowName.trim(), stageFieldName);
      setNewRowName('');
    }
  };

  // Handle delete row
  const handleDeleteSelectedRows = () => {
    const selectedRows = gridRef.current.api.getSelectedRows();
    if (selectedRows.length > 0) {
      if (confirm(`Delete ${selectedRows.length} row(s)?`)) {
        // Sort rows by index in REVERSE order (highest to lowest)
        // This prevents index shifting issues when deleting multiple rows
        const sortedRows = [...selectedRows].sort((a, b) => b._id - a._id);

        sortedRows.forEach(row => {
          chartData.removeStage(row._id);
        });
      }
    }
  };

  const handleToggleHideSelectedRows = () => {
    const selectedRows = gridRef.current.api.getSelectedRows();
    if (selectedRows.length > 0) {
      selectedRows.forEach(row => {
        const isCurrentlyHidden = row.hidden === true;
        chartData.toggleStageHidden(row._id, !isCurrentlyHidden);
      });
    }
  };

  // Handle column reordering
  const handleColumnMoved = useCallback((params) => {
    if (!params.finished || !gridRef.current) return;

    // Get all column definitions in their new order
    const allColumns = gridRef.current.api.getAllGridColumns();

    // Extract field names, filtering out checkbox column and Category/Stage/date
    const newPeriodOrder = allColumns
      .map(col => col.getColDef().field)
      .filter(field => field && field !== 'Category' && field !== 'Stage' && field !== 'date');

    // Update the period order in chartData
    if (chartData.setPeriodOrder) {
      chartData.setPeriodOrder(newPeriodOrder);
    }
  }, [chartData]);

  // Handle paste from clipboard (Excel support)
  const onPasteStart = useCallback((params) => {
    console.log('Paste started', params);
  }, []);

  const onPasteEnd = useCallback((params) => {
    console.log('Paste ended', params);
  }, []);

  // Track focused cell for copy/paste
  const handleCellClicked = useCallback((params) => {
    if (!params.column || !params.node) return;
    if (!params.column.getColDef().field) return; // Skip non-data columns like checkbox

    const rowIndex = params.node.rowIndex;
    const colId = params.column.getColId();

    setFocusedCell({ rowIndex, colId });
  }, []);


  // Keyboard handlers for copy/paste
  useEffect(() => {
    const handleKeyDown = async (event) => {
      if (!gridRef.current?.api) return;

      // Copy (Ctrl+C or Cmd+C)
      if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        event.preventDefault();

        // Get selected rows (via checkboxes)
        const selectedRows = gridRef.current.api.getSelectedRows();

        if (selectedRows.length > 0) {
          // Copy selected rows
          const allColumns = gridRef.current.api.getAllGridColumns();
          const columnIds = allColumns
            .map(col => col.getColDef().field)
            .filter(field => field && field !== '_id');

          let clipboardText = '';
          selectedRows.forEach(rowData => {
            const rowValues = columnIds.map(colId => {
              const value = rowData[colId];
              return value !== null && value !== undefined ? String(value) : '';
            });
            clipboardText += rowValues.join('\t') + '\n';
          });

          await navigator.clipboard.writeText(clipboardText);
        } else if (focusedCell.rowIndex !== null && focusedCell.colId) {
          // Copy single focused cell
          const rowNode = gridRef.current.api.getDisplayedRowAtIndex(focusedCell.rowIndex);
          if (rowNode) {
            const value = rowNode.data[focusedCell.colId];
            await navigator.clipboard.writeText(String(value || ''));
          }
        }
      }

      // Paste (Ctrl+V or Cmd+V)
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        if (focusedCell.rowIndex === null) return;

        event.preventDefault();

        const clipboardText = await navigator.clipboard.readText();
        const rows = clipboardText.trim().split('\n');

        // Get all column IDs
        const allColumns = gridRef.current.api.getAllGridColumns();
        const columnIds = allColumns
          .map(col => col.getColDef().field)
          .filter(field => field && field !== '_id');

        const startColIndex = columnIds.indexOf(focusedCell.colId);
        if (startColIndex === -1) return;

        // Paste starting from the focused cell
        rows.forEach((rowText, rowOffset) => {
          const values = rowText.split('\t');
          const rowIndex = focusedCell.rowIndex + rowOffset;
          const rowNode = gridRef.current.api.getDisplayedRowAtIndex(rowIndex);

          if (!rowNode) return;

          values.forEach((value, colOffset) => {
            const colId = columnIds[startColIndex + colOffset];
            if (!colId) return;

            // Update the data
            const numValue = parseFloat(value);
            const finalValue = isNaN(numValue) ? value : numValue;
            chartData.updateDataValue(rowNode.data._id, colId, finalValue);
          });
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedCell, chartData]);


  // Default column definitions
  const defaultColDef = useMemo(() => ({
    editable: true,
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100,
    flex: 1,
  }), []);

  // Grid options with clipboard support
  const gridOptions = {
    undoRedoCellEditing: true,
    undoRedoCellEditingLimit: 20,
    rowSelection: 'multiple',
    suppressRowClickSelection: true,
    animateRows: true,
    ensureDomOrder: true,
    suppressDragLeaveHidesColumns: true,
  };

  // Refresh cells when hiddenPeriods changes to update styling
  useEffect(() => {
    if (gridRef.current && gridRef.current.api) {
      // Force AG Grid to update column definitions and redraw
      gridRef.current.api.setGridOption('columnDefs', columnDefs);
      gridRef.current.api.redrawRows();
      gridRef.current.api.refreshHeader();
    }
  }, [columnDefs]);

  return (
    <div className="h-full flex flex-col">
      {/* Custom CSS for compact grid with full borders */}
      <style>{`
        .ag-theme-alpine .ag-cell {
          border-right: 1px solid #d1d5db !important;
          border-bottom: 1px solid #d1d5db !important;
          padding: 8px !important;
          line-height: 1.5 !important;
          display: flex !important;
          align-items: center !important;
        }
        .ag-theme-alpine .ag-header-cell {
          border-right: 1px solid #d1d5db !important;
          padding: 8px !important;
          display: flex !important;
          align-items: center !important;
        }
        .ag-theme-alpine .ag-row {
          border-bottom: 1px solid #d1d5db !important;
        }
        .ag-theme-alpine {
          --ag-border-color: #d1d5db;
        }
        /* Fix narrow editing input box - match cell size */
        .ag-theme-alpine .ag-cell-inline-editing input {
          padding: 8px !important;
          box-sizing: border-box !important;
        }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">Edit Data</h2>
          <button
            onClick={handleDeleteSelectedRows}
            className="px-3 py-1.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 flex items-center gap-1"
            title="Delete selected rows"
          >
            🗑️ Delete Selected
          </button>

          <button
            onClick={handleToggleHideSelectedRows}
            className="px-3 py-1.5 bg-gray-600 text-white text-sm font-semibold rounded-lg hover:bg-gray-700"
          >
            Hide/Unhide Selected
          </button>

        </div>
        <div className="flex gap-2">
          <button
            onClick={chartData.transposeData}
            className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700"
            title="Swap rows and columns"
          >
            ⇄ Transpose
          </button>
          <button
            onClick={() => {
              chartData.applyEdits();
              onClose();
            }}
            className="px-4 py-2 bg-cyan-600 text-white text-sm font-semibold rounded-lg hover:bg-cyan-700"
          >
            Apply Changes
          </button>
          <button
            onClick={chartData.resetEdits}
            className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Add Column/Row Controls */}
      <div className="mb-4 flex gap-4">
        {/* Add Row */}
        <div className="flex gap-2 flex-1">
          <input
            type="text"
            value={newRowName}
            onChange={(e) => setNewRowName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddRow()}
            placeholder={`New ${rowLabel.toLowerCase()} name...`}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            onClick={handleAddRow}
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 whitespace-nowrap"
          >
            + Row
          </button>
        </div>

        {/* Add Column */}
        <div className="flex gap-2 flex-1">
          <input
            type="text"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddColumn()}
            placeholder={`New ${colLabel.toLowerCase()} name...`}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            onClick={handleAddColumn}
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 whitespace-nowrap"
          >
            + Column
          </button>
        </div>
      </div>

      {/* AG Grid Table */}
      <div className="flex-1 ag-theme-alpine" style={{ width: '100%', height: '100%' }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          gridOptions={gridOptions}
          onCellValueChanged={onCellValueChanged}
          onPasteStart={onPasteStart}
          onPasteEnd={onPasteEnd}
          onColumnMoved={handleColumnMoved}
          onCellClicked={handleCellClicked}
          rowSelection="multiple"
        />
      </div>
    </div>
  );
}

/**
 * Column Letter Header Component (Top Row: A, B, C, etc.)
 * Contains sort arrows and menu with hide/delete controls
 */
function ColumnLetterHeader(props) {
  const handleSort = (ascending) => {
    props.onSort(ascending);
  };

  const handleHide = () => {
    props.onHide();
  };

  const handleDelete = () => {
    props.onDelete();
  };

  // Category columns show just the letter, no controls
  if (props.isCategory) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 border-b border-gray-300">
        <span className="text-xs font-bold text-gray-500">{props.letter}</span>
      </div>
    );
  }

  const headerStyle = props.isHidden
    ? { backgroundColor: '#d1d5db', opacity: 0.7, fontStyle: 'italic' }
    : {};

  return (
    <div className="relative w-full h-full bg-gray-50 border-b border-gray-300" style={headerStyle}>
      <div className="flex items-center justify-between px-2 h-full gap-2">
        <span className="text-xs font-bold text-gray-600" style={props.isHidden ? { fontStyle: 'italic' } : {}}>{props.letter}</span>

        {/* Control Buttons - Only show if allowed */}
        <div className="flex items-center gap-1">
          {/* Sort Arrows - Only show if sorting is allowed */}
          {props.allowSort && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSort(true);
                }}
                className="text-gray-400 hover:text-cyan-600 text-xs leading-none"
                title="Sort Ascending"
              >
                ▲
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSort(false);
                }}
                className="text-gray-400 hover:text-cyan-600 text-xs leading-none"
                title="Sort Descending"
              >
                ▼
              </button>
            </>
          )}

          {/* Hide Button - Only show if hiding is allowed */}
          {props.allowHide && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleHide();
              }}
              className="text-gray-400 hover:text-blue-600 text-xs leading-none px-0.5"
              title="Hide Column"
            >
              👁️
            </button>
          )}

          {/* Delete Button - Only show if deletion is allowed */}
          {props.allowDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="text-gray-400 hover:text-red-600 text-xs leading-none px-0.5"
              title="Delete Column"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Editable Column Name Component (Bottom Row)
 * Allows double-click to rename
 */
function EditableColumnName(props) {
  const [isEditing, setIsEditing] = useState(false);
  const [headerName, setHeaderName] = useState(props.columnName);

  const handleRename = () => {
    if (headerName !== props.columnName) {
      props.onRename(headerName);
    }
    setIsEditing(false);
  };

  const headerStyle = props.isHidden
    ? { backgroundColor: '#d1d5db', opacity: 0.7, fontStyle: 'italic' }
    : {};

  return (
    <div className="w-full px-2 py-1" style={headerStyle}>
      {isEditing ? (
        <input
          type="text"
          value={headerName}
          onChange={(e) => setHeaderName(e.target.value)}
          onBlur={handleRename}
          onKeyPress={(e) => e.key === 'Enter' && handleRename()}
          className="w-full px-1 py-0.5 text-sm border border-cyan-500 rounded focus:outline-none"
          autoFocus
        />
      ) : (
        <div
          className="text-sm font-medium text-gray-700 cursor-pointer hover:text-cyan-600"
          style={props.isHidden ? { fontStyle: 'italic' } : {}}
          onDoubleClick={() => setIsEditing(true)}
          title="Double-click to rename"
        >
          {headerName}
        </div>
      )}
    </div>
  );
}

export default SpreadsheetDataTable;
