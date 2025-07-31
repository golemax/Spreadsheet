export function updateSelected({
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
    const selections = request.selections
    
    if (!util.arrayElementAssert(printErrorHeader, ws, selections, "selections")) return
    
    for (const selectionIndex in selections) {
        const selection = selections[selectionIndex]
        if (!util.objectElementAssert(printErrorHeader, ws, selection, "selections[" + selectionIndex + "]")) return
        if (!util.intElementAssert(printErrorHeader, ws, selection.startColumn, "selections[" + selectionIndex + "].startColumn")) return
        if (!util.intElementAssert(printErrorHeader, ws, selection.startRow, "selections[" + selectionIndex + "].startRow")) return
        if (!util.intElementAssert(printErrorHeader, ws, selection.endColumn, "selections[" + selectionIndex + "].endColumn")) return
        if (!util.intElementAssert(printErrorHeader, ws, selection.endRow, "selections[" + selectionIndex + "].endRow")) return
        if (selection.startColumn <= 0) {
            console.log(printErrorHeader + "Invalid request")
            ws.send(JSON.stringify({error: "selections[" + selectionIndex + "].startColumn need to be non-null positive"}))
            return
        }
        if (selection.startRow <= 0) {
            console.log(printErrorHeader + "Invalid request")
            ws.send(JSON.stringify({error: "selections[" + selectionIndex + "].startRow need to be non-null positive"}))
            return
        }
        if (selection.endColumn < 0) {
            console.log(printErrorHeader + "Invalid request")
            ws.send(JSON.stringify({error: "selections[" + selectionIndex + "].endColumn need to be positive"}))
            return
        }
        if (selection.endRow < 0) {
            console.log(printErrorHeader + "Invalid request")
            ws.send(JSON.stringify({error: "selections[" + selectionIndex + "].endRow need to be positive"}))
            return
        }
        if (selection.startColumn > sheet.columns) {
            console.log(printErrorHeader + "Invalid request")
            ws.send(JSON.stringify({error: "selections[" + selectionIndex + "].startColumn " +
                "is more than sheet's existing column number"}))
            return
        }
        if (selection.startRow > sheet.rows) {
            console.log(printErrorHeader + "Invalid request")
            ws.send(JSON.stringify({error: "selections[" + selectionIndex + "].startRow " +
                "is more than sheet's existing row number"}))
            return
        }
        if (selection.endColumn > sheet.columns) {
            console.log(printErrorHeader + "Invalid request")
            ws.send(JSON.stringify({error: "selections[" + selectionIndex + "].endColumn " +
                "is more than sheet's existing column number, use zero if you want it to had max size"}))
            return
        }
        if (selection.endRow > sheet.rows) {
            console.log(printErrorHeader + "Invalid request")
            ws.send(JSON.stringify({error: "selections[" + selectionIndex + "].endRow " +
                "is more than sheet's existing row number, use zero if you want it to had max size"}))
            return
        }
    }

    console.log(printHeader + "Change selected ranges")

    client.sheets.filter(sh => sh.sheetID == sheetID)[0].selections = selections
    for (const clientToken of sheet.connected)
        if (clientToken == token)
            connections[clientToken].websocket.send(JSON.stringify({
                valid: true
            }))
        else {
            const selectionList = []
            for (const connectedToken of sheet.connected)
                if (connectedToken != clientToken)
                    connections[connectedToken].sheets.filter(sh => sh.sheetID == sheetID)[0]
                        .selections.forEach(element => selectionList.push(element))
            connections[clientToken].websocket.send(JSON.stringify({
                action: "updateExternalSelections",
                selections: selectionList
            }))
        }
}