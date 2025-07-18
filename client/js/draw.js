export async function animationLoop() {
    const util = await import("./util.js")

    /** @type {ClientSheet} */
    let clientSheet
    for (clientSheet of globalThis.spreadsheet) {
        // shortcut variables
        const canvas = clientSheet.context.canvas
        const ctx = clientSheet.context
        const sheet = clientSheet.sheet

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
        for (let row = 1; sheet.infinite ? (offset < canvas.height) : (row <= sheet.rows); row++) {
            ctx.save()
            const position = [0, offset, sheet.rowsWidth, sheet.defaultRowsHeight]
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
            ctx.fillText(row, sheet.rowsWidth/2, offset + sheet.defaultRowsHeight/2)
            offset += sheet.defaultRowsHeight
            ctx.restore()
        }

        // columns headers
        offset = sheet.rowsWidth
        for (let column = 1; sheet.infinite ? (offset < canvas.width) : (column <= sheet.columns); column++) {
            ctx.save()
            const position = [offset, 0, sheet.defaultColumnsWidth, sheet.columnsHeight]
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
            ctx.fillText(util.numberToAlphabet(column), offset + sheet.defaultColumnsWidth/2, sheet.columnsHeight/2)
            offset += sheet.defaultColumnsWidth
            ctx.restore()
        }

        // values
        const cellProp = sheet.defaultCellsProperty
        let rowOffset = sheet.columnsHeight
        let columnOffset
        for (let row = 0; sheet.infinite ? (rowOffset < canvas.height) : (row < sheet.rows); row++) {
            columnOffset = sheet.rowsWidth
            for (let column = 0; sheet.infinite ? (columnOffset < canvas.width) : (column < sheet.columns); column++) {
                ctx.save()
                const position = [columnOffset, rowOffset, sheet.defaultColumnsWidth, sheet.defaultRowsHeight]
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
                ctx.rect(...position)
                ctx.clip()
                ctx.fillText(sheet.values[column]?.[row]?.value ?? "", columnOffset + sheet.defaultColumnsWidth/2, rowOffset + sheet.defaultRowsHeight/2)
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
            if (range.endRow == 0)
                endRowOffset = (canvas.height - rowOffset)
            else
                for (let row = range.startRow; row <= range.endRow; row++)
                    endRowOffset += sheet.defaultRowsHeight
            let endColumnOffset = 0
            if (range.endColumn == 0)
                endColumnOffset = (canvas.width - columnOffset)
            else
                for (let column = range.startColumn; column <= range.endColumn; column++)
                    endColumnOffset += sheet.defaultColumnsWidth
            
            const position = [columnOffset, rowOffset, endColumnOffset, endRowOffset]
            ctx.globalAlpha = 0.25
            ctx.fillRect(...position)
            ctx.globalAlpha = 1
            ctx.strokeRect(...position)
        }
        ctx.restore()
    }
    requestAnimationFrame(animationLoop)
}