const sheetDefault = (await import("./default.js"))

/**
 * Create new rows
 * @param {Sheet} sheet 
 * @param {Number} num 
 */
export function addRows(sheet, num) {
    sheet.values.forEach(column => {
        for(let i = 0; i < num; i++) {
            column.push(sheetDefault.newCell())
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
            column.push(sheetDefault.newCell())
        }
        sheet.values.push(column)
    }
    sheet.columns += num
}