const {numberToAlphabet} = await import("../../common/util.js")
const sheetUtil = await import("../../common/sheetUtil.js")

export function updateCellValue({
    ws, 
    util,
    token,
    sheet,
    client,
    sheets, 
    request, 
    sheetID, 
    address, 
    savePath, 
    printHeader, 
    connections,
    printErrorHeader
}) {
    const {row, column, value} = request
    
    if (!util.intElementAssert(printErrorHeader, ws, row, "row")) return
    if (!util.intElementAssert(printErrorHeader, ws, column, "column")) return
    if (!util.stringElementAssert(printErrorHeader, ws, value, "value")) return

    if (row <= 0) {
        console.log(printErrorHeader + "Invalid request")
        ws.send(JSON.stringify({error: "row need to be non-null positive"}))
        return
    }

    if (column <= 0) {
        console.log(printErrorHeader + "Invalid request")
        ws.send(JSON.stringify({error: "column need to be non-null positive"}))
        return
    }

    const sheetData = sheet.sheetData

    if (sheetData.infinite) {
        if (row > sheetData.rows) {
            const numNewRows = row - sheetData.rows
            sheetUtil.addRows(sheetData, numNewRows)
            for (const clientToken of sheet.connected) {
                connections[clientToken].websocket.send(JSON.stringify({
                    action: "addRows",
                    number: numNewRows,
                }))
            }
        }
        
        if (column > sheetData.columns) {
            const numNewColumns = column - sheetData.columns
            sheetUtil.addColumns(sheetData, numNewColumns)
            for (const clientToken of sheet.connected) {
                connections[clientToken].websocket.send(JSON.stringify({
                    action: "addColumns",
                    number: numNewColumns,
                }))
            }
        }

    } else {
        if (row > sheetData.rows) {
            console.log(printErrorHeader + "Refused request")
            ws.send(JSON.stringify({error: "row is more than sheet's existing row number"}))
            return
        }

        if (column > sheetData.columns) {
            console.log(printErrorHeader + "Refused request")
            ws.send(JSON.stringify({error: "column is more than sheet's existing column number"}))
            return
        }
    }
    sheetData.values[column-1][row-1].value = value
    util.updateSheet(sheetData, savePath)
    console.log(printHeader + "Edit cell " + numberToAlphabet(column) + row + " at value \"" + value + "\"")
    for (const clientToken of sheet.connected)
        if (clientToken == token)
            ws.send(JSON.stringify({
                valid: true
            }))
        else
            connections[clientToken].websocket.send(JSON.stringify({
                action: "updateCellValue",
                row: row,
                column: column,
                value: value
            }))
}