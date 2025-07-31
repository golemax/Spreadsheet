/**
 * 
 * @param {ClientSheet} clientSheet 
 * @param {Number} x 
 * @param {Number} y 
 */
export function getCellAtPos(clientSheet, x, y) {
    const canvas = clientSheet.context.canvas
    const canvasPos = canvas.getBoundingClientRect()
    const sheet = clientSheet.sheet
    const state = clientSheet.state
    const mousePosX = x - canvasPos.x
    const mousePosY = y - canvasPos.y
    if (mousePosX >= 0 && mousePosX <= canvas.width && mousePosY >= 0 && mousePosY <= canvas.height) {
        if (mousePosX <= sheet.rowsWidth && mousePosY <= sheet.columnsHeight) {
            return [0, 0]
        } else {
            function getRow() {
                let offset = state.firstVisibleRowOffset
                let index = state.firstVisibleRow
                while (!(offset < mousePosY && mousePosY <= (offset + sheet.defaultRowsHeight))) {
                    index++
                    offset += sheet.defaultRowsHeight
                }
                return index
            }

            function getColumn() {
                let offset = state.firstVisibleColumnOffset
                let index = state.firstVisibleColumn
                while (!(offset < mousePosX && mousePosX <= (offset + sheet.defaultColumnsWidth))) {
                    index++
                    offset += sheet.defaultColumnsWidth
                }
                return index
            }

            if (mousePosX <= sheet.rowsWidth) {
                const row = getRow()
                if(row > clientSheet.sheet.rows && !clientSheet.sheet.infinite)
                    return [1, clientSheet.sheet.rows]
                else
                    return [0, row]
            } else if (mousePosY <= sheet.columnsHeight) {
                const col = getColumn()
                if(col > clientSheet.sheet.columns && !clientSheet.sheet.infinite)
                    return [clientSheet.sheet.columns, 1]
                else
                    return [col, 0]
            } else {
                const col = getColumn()
                const row = getRow()
                if(clientSheet.sheet.infinite) {
                    return [col, row]
                } else {
                    return [Math.min(getColumn(), clientSheet.sheet.columns),
                            Math.min(getRow(), clientSheet.sheet.rows)]
                }
            }
        }
    }
}