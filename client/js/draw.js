export async function animationLoop() {
    const util = await import("./common/util.js")

    /** @type {ClientSheet} */
    let clientSheet
    for (clientSheet of globalThis.spreadsheet) {
        // shortcut variables
        const canvas = clientSheet.context.canvas
        const ctx = clientSheet.context
        const sheet = clientSheet.sheet
        const state = clientSheet.state

        // init canvas
        canvas.width = canvas.clientWidth
        canvas.height = canvas.clientHeight
        ctx.strokeRect(0, 0, canvas.width, canvas.height)

        // edge
        const headProp = sheet.headersProperty
        ctx.fillStyle = headProp.backgroundColor
        const edgePos = [0, 0, sheet.rowsWidth, sheet.columnsHeight]
        ctx.fillRect(...edgePos)
        ctx.strokeRect(...edgePos)

        // rows headers
        let offset = sheet.columnsHeight
        ctx.save()
        const rowHeaderClip = new Path2D()
        rowHeaderClip.rect(0, sheet.columnsHeight, sheet.rowsWidth, canvas.height - sheet.columnsHeight)
        ctx.clip(rowHeaderClip)
        for (let row = 1; ((offset - state.yOffset) < canvas.height) && (sheet.infinite || (row <= sheet.rows)); row++) {
            ctx.save()
            const position = [0, offset - state.yOffset, sheet.rowsWidth, sheet.defaultRowsHeight]
            if ((position[1] <= sheet.columnsHeight) && ((position[1] + position[3]) > sheet.columnsHeight)) {
                state.firstVisibleRow = row
                state.firstVisibleRowOffset = position[1]
            }
            ctx.fillStyle = headProp.backgroundColor
            ctx.fillRect(...position)
            ctx.strokeRect(...position)
            ctx.font =
                (headProp.italic ? "italic " : "") +
                (headProp.bold ? "bold " : "") +
                headProp.fontSize + "px " +
                headProp.font
            ctx.fillStyle = headProp.textColor
            ctx.textBaseline = "middle"
            ctx.textAlign = "center";
            ctx.rect(...position)
            ctx.clip()
            ctx.fillText(row, sheet.rowsWidth/2, offset + sheet.defaultRowsHeight/2 - state.yOffset)
            offset += sheet.defaultRowsHeight
            ctx.restore()
        }
        if (!sheet.infinite) {
            ctx.save()
            const addRowButtonPosition = [0, offset - state.yOffset, sheet.rowsWidth, sheet.columnsHeight/4*3]
            ctx.fillStyle = headProp.backgroundColor
            const addRowButtonClip = new Path2D()
            addRowButtonClip.rect(...addRowButtonPosition)
            ctx.clip(addRowButtonClip)
            ctx.fillRect(...addRowButtonPosition)
            ctx.strokeRect(...addRowButtonPosition)
            ctx.font =
                (headProp.bold ? "bold " : "") +
                headProp.fontSize + "px " +
                headProp.font
            ctx.fillStyle = headProp.textColor
            ctx.textBaseline = "middle"
            ctx.textAlign = "center";
            ctx.fillText("+", sheet.rowsWidth/2, offset + sheet.columnsHeight/8*3 - state.yOffset)
            ctx.restore()
        }
        ctx.restore()

        // columns headers
        offset = sheet.rowsWidth
        ctx.save()
        const columnHeaderClip = new Path2D()
        columnHeaderClip.rect(sheet.rowsWidth, 0, canvas.width - sheet.rowsWidth, sheet.columnsHeight)
        ctx.clip(columnHeaderClip)
        for (let column = 1; sheet.infinite ? ((offset - state.xOffset) < canvas.width) : (column <= sheet.columns); column++) {
            ctx.save()
            const position = [offset - state.xOffset, 0, sheet.defaultColumnsWidth, sheet.columnsHeight]
            if ((position[0] <= sheet.rowsWidth) && ((position[0] + position[2]) > sheet.rowsWidth)) {
                state.firstVisibleColumn = column
                state.firstVisibleColumnOffset = position[0]
            }
            ctx.fillStyle = headProp.backgroundColor
            const cellClip = new Path2D()
            cellClip.rect(...position)
            ctx.clip(cellClip)
            ctx.fillRect(...position)
            ctx.strokeRect(...position)
            ctx.font =
                (headProp.italic ? "italic " : "") +
                (headProp.bold ? "bold " : "") +
                headProp.fontSize + "px " +
                headProp.font
            ctx.fillStyle = headProp.textColor
            ctx.textBaseline = "middle"
            ctx.textAlign = "center";
            ctx.fillText(util.numberToAlphabet(column), offset + sheet.defaultColumnsWidth/2 - state.xOffset, sheet.columnsHeight/2)
            offset += sheet.defaultColumnsWidth
            ctx.restore()
        }
        if (!sheet.infinite) {
            ctx.save()
            const addColumnButtonPosition = [offset - state.xOffset, 0, sheet.columnsHeight/4*3, sheet.columnsHeight]
            ctx.fillStyle = headProp.backgroundColor
            const addColumnButtonClip = new Path2D()
            addColumnButtonClip.rect(...addColumnButtonPosition)
            ctx.clip(addColumnButtonClip)
            ctx.fillRect(...addColumnButtonPosition)
            ctx.strokeRect(...addColumnButtonPosition)
            ctx.font =
                (headProp.bold ? "bold " : "") +
                headProp.fontSize + "px " +
                headProp.font
            ctx.fillStyle = headProp.textColor
            ctx.textBaseline = "middle"
            ctx.textAlign = "center";
            ctx.fillText("+", offset + sheet.columnsHeight/8*3- state.xOffset, sheet.columnsHeight/2)
            ctx.restore()
        }
        ctx.restore()

        // values
        let rowOffset = sheet.columnsHeight
        let columnOffset = sheet.rowsWidth
        const cellProp = sheet.defaultCellsProperty
        const actualSelection = clientSheet.state.selection[clientSheet.state.actualSelection]
        const actualSelectionX = actualSelection.startColumn + clientSheet.state.selectionOffsetX - 1
        const actualSelectionY = actualSelection.startRow + clientSheet.state.selectionOffsetY - 1
        ctx.save()
        const gridClip = new Path2D()
        gridClip.rect(
            columnOffset,
            rowOffset,
            canvas.width - sheet.rowsWidth,
            canvas.height - sheet.columnsHeight)
        ctx.clip(gridClip)
        for (let row = 0; sheet.infinite ? ((rowOffset - state.yOffset) < canvas.height) : (row < sheet.rows); row++) {
            columnOffset = sheet.rowsWidth
            for (let column = 0; sheet.infinite ? ((columnOffset - state.xOffset) - state.xOffset < canvas.width) : (column < sheet.columns); column++) {
                ctx.save()
                const position = [columnOffset - state.xOffset, rowOffset - state.yOffset, sheet.defaultColumnsWidth, sheet.defaultRowsHeight]
                ctx.fillStyle = cellProp.backgroundColor
                ctx.fillRect(...position)
                ctx.lineWidth = 0.1
                ctx.strokeRect(...position)
                ctx.font =
                    (cellProp.italic ? "italic " : "") +
                    (cellProp.bold ? "bold " : "") +
                    cellProp.fontSize + "px " +
                    cellProp.font
                ctx.fillStyle = cellProp.textColor
                ctx.textBaseline = "middle"
                ctx.textAlign = "center";
                const cellClip = new Path2D()
                cellClip.rect(...position)
                ctx.clip(cellClip)
                ctx.fillText(sheet.values[column]?.[row]?.value ?? "", columnOffset + sheet.defaultColumnsWidth/2, rowOffset + sheet.defaultRowsHeight/2)
                if (column == actualSelectionX && row == actualSelectionY) {
                    ctx.lineWidth = 2.25
                    ctx.strokeRect(...position)
                }
                columnOffset += sheet.defaultColumnsWidth
                ctx.restore()
            }
            rowOffset += sheet.defaultRowsHeight
        }

        // selections
        ctx.save()
        ctx.fillStyle = "blue"
        ctx.lineWidth = 2.25
        for (const range of clientSheet.state.selection) {
            rowOffset = sheet.columnsHeight
            for (let row = 1; row < range.startRow; row++)
                rowOffset += sheet.defaultRowsHeight
            columnOffset = sheet.rowsWidth
            for (let column = 1; column < range.startColumn; column++)
                columnOffset += sheet.defaultColumnsWidth
            let endRowOffset = 0
            if (range.endRow == 0 && sheet.infinite)
                endRowOffset = (canvas.height - rowOffset)
            else if (range.endRow == 0)
                for (let row = range.startRow; row <= sheet.rows; row++)
                    endRowOffset += sheet.defaultRowsHeight
            else
                for (let row = range.startRow; row <= range.endRow; row++)
                    endRowOffset += sheet.defaultRowsHeight
            let endColumnOffset = 0
            if (range.endColumn == 0 && sheet.infinite)
                endColumnOffset = (canvas.width - columnOffset)
            else if (range.endColumn == 0)
                for (let column = range.startColumn; column <= sheet.columns; column++)
                    endColumnOffset += sheet.defaultColumnsWidth
            else
                for (let column = range.startColumn; column <= range.endColumn; column++)
                    endColumnOffset += sheet.defaultColumnsWidth
            
            const position = [columnOffset - state.xOffset, rowOffset - state.yOffset, endColumnOffset, endRowOffset]
            ctx.globalAlpha = 0.25
            ctx.fillRect(...position)
            ctx.globalAlpha = 1
            ctx.strokeRect(...position)
        }
        ctx.restore()

        // others selections
        ctx.save()
        ctx.fillStyle = "red"
        ctx.lineWidth = 2.25
        for (const range of clientSheet.otherSelections) {
            rowOffset = sheet.columnsHeight
            for (let row = 1; row < range.startRow; row++)
                rowOffset += sheet.defaultRowsHeight
            columnOffset = sheet.rowsWidth
            for (let column = 1; column < range.startColumn; column++)
                columnOffset += sheet.defaultColumnsWidth
            let endRowOffset = 0
            if (range.endRow == 0 && sheet.infinite)
                endRowOffset = (canvas.height - rowOffset)
            else if (range.endRow == 0)
                for (let row = range.startRow; row <= sheet.rows; row++)
                    endRowOffset += sheet.defaultRowsHeight
            else
                for (let row = range.startRow; row <= range.endRow; row++)
                    endRowOffset += sheet.defaultRowsHeight
            let endColumnOffset = 0
            if (range.endColumn == 0 && sheet.infinite)
                endColumnOffset = (canvas.width - columnOffset)
            else if (range.endColumn == 0)
                for (let column = range.startColumn; column <= sheet.columns; column++)
                    endColumnOffset += sheet.defaultColumnsWidth
            else
                for (let column = range.startColumn; column <= range.endColumn; column++)
                    endColumnOffset += sheet.defaultColumnsWidth
            
            const position = [columnOffset - state.xOffset, rowOffset - state.yOffset, endColumnOffset, endRowOffset]
            ctx.globalAlpha = 0.10
            ctx.fillRect(...position)
            ctx.globalAlpha = 1
            ctx.strokeRect(...position)
        }
        ctx.restore()
    }
    requestAnimationFrame(animationLoop)
}