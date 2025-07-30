const sheet = await import("./sheet.js")

export function fillCellMatrix(columns, rows) {
    const values = []
    for (let column = 0; column < columns; column++) {
        values.push([])
        for (let row = 0; row < rows; row++) {
            values[column].push(sheet.newCell())
        }
    }
    return values
}


export function numberToAlphabet(number) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    let result = ""
    while (true) {
        number -= 1
        const charIndex = number % alphabet.length
        if (number == charIndex) {
            return alphabet[charIndex] + result
        } else {
            result = alphabet[charIndex] + result
            number = Math.floor(number / alphabet.length)
        }
    }
}

export function alphabetToNumber(serie) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    let res = 0
    for (let index = 0; index < serie.length; index++) {
        res += (alphabet.indexOf(serie[index]) + 1) * Math.pow(alphabet.length, serie.length - 1 - index)
    }
    return res
}

export function selectionA1toObject(text) {
    return text.split(" ")
        .map(range => {
            let rangeTry = rangeA1toObject(range)
            if (rangeTry != undefined) return rangeTry
            rangeTry = A1toRangeObject(range)
            if (rangeTry == undefined) return undefined
            if (rangeTry.startColumn == 0 && rangeTry.startRow == 0) return undefined
            return rangeTry
        })
        .filter(value => value != undefined)
}

export function prettifySelection(selection) {
    return selection.map(range =>
        ((range.startRow == range.endRow && range.startColumn == 1 && range.startColumn != range.endColumn) ? "" : numberToAlphabet(range.startColumn)) +
        ((range.startColumn == range.endColumn && range.startRow == 1 && range.startRow != range.endRow) ? "" : range.startRow) +
        (
            (range.startColumn == range.endColumn && range.startRow == range.endRow) ? "" : (":" +
                (range.endColumn == 0 ? "" : numberToAlphabet(range.endColumn)) +
                (range.endRow == 0 ? "" : range.endRow) +
                ((range.endColumn == 0 && range.endRow == 0) ? "0" : "")
            )
        )
    ).join(" ")
}

export function rangeA1toObject(text) {
    const faces = text.split(":").map(value => A1toRangeObject(value))
    if (faces.length != 2) return undefined
    if(faces[0] == undefined || faces[1] == undefined) return undefined

    const face0AxeX = faces[0].endColumn == 0
    const face1AxeX = faces[1].endColumn == 0
    const face0AxeY = faces[0].endRow == 0
    const face1AxeY = faces[1].endRow == 0
    if ((face0AxeX && !(face0AxeX && face0AxeY)) && (face1AxeY && !(face1AxeX && face1AxeY)) ||
        (face1AxeX && !(face1AxeX && face1AxeY)) && (face0AxeY && !(face0AxeX && face0AxeY)))
        return undefined

    let startColumn
    let endColumn
    if (faces[0].endColumn == 0 && faces[1].endColumn == 0) {
        startColumn = 1
        endColumn = 0
    } else if (faces[0].endColumn == 0) {
        startColumn = faces[1].endColumn
        endColumn = 0
    } else if (faces[1].endColumn == 0) {
        startColumn = faces[0].endColumn
        endColumn = 0
    } else {
        startColumn = Math.min(faces[0].startColumn, faces[1].startColumn)
        endColumn = Math.max(faces[0].endColumn, faces[1].endColumn)
    }

    let startRow
    let endRow
    if (faces[0].endRow == 0 && faces[1].endRow == 0) {
        startRow = 1
        endRow = 0
    } else if (faces[0].endRow == 0) {
        startRow = faces[1].endRow
        endRow = 0
    } else if (faces[1].endRow == 0) {
        startRow = faces[0].endRow
        endRow = 0
    } else {
        startRow = Math.min(faces[0].startRow, faces[1].startRow)
        endRow = Math.max(faces[0].endRow, faces[1].endRow)
    }

    return {
        startColumn: startColumn,
        startRow: startRow,
        endColumn: endColumn,
        endRow: endRow
    }
}

export function A1toRangeObject(text) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const number = "0123456789"
    let columnPart = ""
    let rowPart = ""
    let rowZone = false
    for (let index = 0; index < text.length; index++) {
        const char = text[index].toUpperCase()
        if (rowZone) {
            if (number.includes(char)) {
                rowPart += char
            } else {
                return undefined
            }
        } else {
            if (alphabet.includes(char)) {
                columnPart += char
            } else if (number.includes(char)) {
                rowPart += char
                rowZone = true
            } else {
                return undefined
            }
        }
    }
    const column = (columnPart == "") ? 0 : alphabetToNumber(columnPart)
    const row = (rowPart == "") ? 0 : parseInt(rowPart)

    return {
        startColumn: column == 0 ? 1 : column,
        startRow: row == 0 ? 1 : row,
        endColumn: column,
        endRow: row
    }
}

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