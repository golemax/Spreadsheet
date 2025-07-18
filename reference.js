/**
 * Function representation
 * @typedef {Object} SheetFunction
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

/**
 * Menu
 * @typedef {Object} ClientMenu
 * @property {ClientMenuItem[]} - content of menu
 * @property {Number} x - x position on screen
 * @property {Number} y - y position on screen
 * @property {Number} width - width on screen
 * @property {Number} height - height on screen
 */

/**
 * Client state
 * @typedef {Object} ClientState
 * @property {Number} xOffset - Offset on X axe on the grid
 * @property {Number} yOffset - Offset on Y axe on the grid
 * @property {ClientMenu} menu - Menu, or null
 * @property {SheetRange[]} selection - Cells selection
 * @property {Number} actualSelection - Which selection is currently selected
 * @property {Number} selectionOffsetX - X offset in selection
 * @property {Number} selectionOffsetY - Y offset in selection
 * @property {Number} xStartDragging - X pos when mouse started to drag
 * @property {Number} yStartDragging - Y pos when mouse started to drag
 * @property {boolean} shift - Touch SHIFT pressed
 * @property {boolean} ctrl - Touch CTRL pressed
 * @property {boolean} alt - Touch ALT pressed
 */

/**
 * Client sheet representation
 * @typedef {Object} ClientSheet
 * @property {Sheet} sheet - Sheet
 * @property {ClientState} state - Client state
 * @property {HTMLDivElement} element - Linked HTML element
 * @property {CanvasRenderingContext2D} context - 2D Drawing context
 */