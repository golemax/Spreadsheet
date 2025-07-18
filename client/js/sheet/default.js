/**
 * Create a new empty cell
 * @returns {Cell}
 */
function newCell() {
    return {
        value: "",
        function: "",
        property: null
    }
}

/**
 * Create a new cell property object for cells
 * @returns {CellProperty}
 */
function newCellsProperty() {
    return {
        font: "sans-serif",
        fontSize: 12,
        bold: false,
        italic: false,
        backgroundColor: "white",
        textColor: "black"
    }
}

/**
 * Create a new cell property object for headers
 * @returns {CellProperty}
 */
function newHeadersProperty() {
    return {
        font: "sans-serif",
        fontSize: 12,
        bold: true,
        italic: false,
        backgroundColor: "LightGray",
        textColor: "black"
    }
}

/**
 * Create a new empty sheet
 * @param {boolean} infinite - Is infinite & auto-resizable sheet
 * @returns {Sheet}
 */
export function newSheet(infinite) {
    return {
        rows: 1,
        columns: 1,
        values: [[newCell()]],

        readedRanges: [],
        computedRanges: [],

        rangeProperty: [],
        rowsProperty: [],
        columnsProperty: [],

        defaultCellsProperty: newCellsProperty(),
        headersProperty: newHeadersProperty(),

        defaultRowsHeight: 21,
        defaultColumnsWidth: 100,
        rowsWidth: 46,
        columnsHeight: 24,

        infinite: infinite
    }
}

/**
 * Create new rows
 * @param {Sheet} sheet 
 * @param {Number} num 
 */
export function addRows(sheet, num) {
    sheet.values.forEach(column => {
        for(let i = 0; i < num; i++) {
            column.push(newCell())
        }
    })
    sheet.rows += num
}

/**
 * Create new columns
 * @param {Sheet} sheet 
 * @param {Number} num 
 */
export function addColumns(sheet, num) {
    for(let i = 0; i < num; i++) {
        const column = []
        for(let j = 0; j < sheet.rows; j++) {
            column.push(newCell())
        }
        sheet.values.push(column)
    }
    sheet.columns += num
}