/**
 * Parsing error for function
 * @typedef {Object} FunctionParseError
 * @property {String} type - normalized error name
 * @property {String} comment - user friendly error name
 * @property {Number} startChar - where the error start
 * @property {Number} endChar - where the error end
 */

/**
 * Function expression
 * @typedef {Object} FunctionExpression
 * @property {String} type - type of value
 * @property {*} value - content value, depend of type
 * @property {Number} fromChar - where the expression start, useful for debugging
 * @property {Number} toChar - where the expression end, useful for debugging
 */

/**
 * Function representation
 * @typedef {Object} SheetFunction
 * @property {boolean} error - have a parsing error
 * @property {(FunctionExpression|FunctionParseError)} def - parsed expression or error details
 */

/**
 * Cell visual property
 * @typedef {Object} CellProperty
 * @property {String} font
 * @property {String} fontSize
 * @property {boolean} bold
 * @property {boolean} italic
 * @property {String} backgroundColor
 * @property {String} textColor
 */

/**
 * Cell representation
 * @typedef {Object} Cell
 * @property {String} value - Input of the cell
 * @property {SheetFunction} function - Associated function (or null)
 * @property {String} visibleValue - result of function or value of cell
 * @property {CellProperty} property - Property of the cell (or null for )
 */

/**
 * Range
 * @typedef {Object} SheetRange
 * @property {Number} startColumn - Where range's column start
 * @property {Number} startRow - Where range's row start
 * @property {Number} endColumn - Where range's column end (or null for maximum)
 * @property {Number} endRow - Where range's row end (or null for maximum)
 */

/**
 * Line property
 * @typedef {Object} LineProperty
 * @property {Number} index - index of the line
 * @property {Number} size - size of axe
 * @property {boolean} hidden - hidden line
 */

/**
 * Range property
 * @typedef {Object} RangeProperty
 * @property {CellProperty} cellsProperty - Cells default property
 * @property {SheetRange} range - Range where property apply
 */

/**
 * Readed Range
 * @typedef ReadedRange
*  @property {Cell} reader - Reader Cell
 * @property {SheetRange} range - Readed range
 */

/**
 * Sheet representation
 * @typedef {Object} Sheet
 * @property {Number} rows - Number of rows
 * @property {Number} columns - Number of columns
 * @property {Cell[][]} values - Store cells from at format values[column][row]
 * 
 * @property {ReadedRange[]} readedRanges - List of ranges and range's readers
 * @property {SheetRange[]} computedRanges - List of computed range by a array cell
 * 
 * @property {RangeProperty[]} rangeProperty - List of ranges and range's readers
 * @property {LineProperty[]} rowsProperty - Property of rows
 * @property {LineProperty[]} columnsProperty - Property of columns
 * 
 * @property {CellProperty} defaultCellsProperty - default cells property
 * @property {CellProperty} headersProperty - rows and columns headers property
 * 
 * @property {Number} defaultRowsHeight - default row's header height
 * @property {Number} defaultColumnsWidth - default column's header width
 * @property {Number} rowsWidth - rows's header width
 * @property {Number} columnsHeight - columns's header height
 * 
 * @property {boolean} infinite - Appear at infinite sheet and auto resize
 */

/**
 * Menu Item
 * @typedef {Object} ClientMenuItem
 * @property {String} text - Visible text
 * @property {String} key - Internal value
 * @property {boolean} clickable - Enable or disable button
 * @property {ClientMenu} submenu - Submenu on click, or null
 */

/** Zone on screen
 * @typedef {Object} Zone
 * @property {Number} x - x position on screen
 * @property {Number} y - y position on screen
 * @property {Number} width - width on screen
 * @property {Number} height - height on screen
 */

/**
 * Menu
 * @typedef {Object} ClientMenu
 * @property {ClientMenuItem[]} - content of menu
 * @property {Zone} zone - zone on screen
 */

/**
 * Client drawing's state
 * @typedef {Object} ClientState
 * 
 * mouse
 * @property {Number} xOffset - Offset on X axe on the grid
 * @property {Number} yOffset - Offset on Y axe on the grid
 * @property {ClientMenu} menu - Menu, or null
 * 
 * selection
 * @property {SheetRange[]} selection - Cells selection
 * @property {Number} actualSelection - Which selection is currently selected
 * @property {Number} selectionOffsetX - X offset in selection
 * @property {Number} selectionOffsetY - Y offset in selection
 * 
 * permit to select headers
 * @property {Number} xStartDraggingCell - X cell when mouse started to drag (null for unused, 0 for header)
 * @property {Number} yStartDraggingCell - Y cell when mouse started to drag (null for unused, 0 for header)
 * 
 * optimisation for selection computing
 * @property {Number} firstVisibleColumn - first visible column in viewport (1 based)
 * @property {Number} firstVisibleRow - first visible row in viewport (1 based)
 * @property {Number} firstVisibleColumnOffset - pixels between start of first visible column and his visible part
 * @property {Number} firstVisibleRowOffset - pixels between start of first visible row and his visible part
 */

/**
 * Client sheet representation
 * @typedef {Object} ClientSheet
 * @property {Sheet} sheet - Sheet
 * @property {String} token - Client token for server identifying
 * @property {WebSocket} server - Linked server
 * @property {ClientState} state - Client state
 * @property {SheetRange[]} otherSelections - Selection of other clients
 * @property {HTMLDivElement} element - Linked HTML element
 * @property {CanvasRenderingContext2D} context - 2D Drawing context
 */