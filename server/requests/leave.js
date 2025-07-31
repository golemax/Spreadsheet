const {sheetTokenLength} = await import("./createSheet.js")

export function leave({
    ws, 
    util,
    token,
    sheet,
    client,
    sheets, 
    sheetID, 
    savePath,
    printHeader,
    connections
}) {
    if (client.sheets.filter(sh => sh.sheetID == sheetID).length == 0) {
        console.log(printHeader + "Refused request")
        ws.send(JSON.stringify({
            valid: false,
            description: "Sheet not joined"
        }))
        return
    }

    client.sheets = client.sheets.filter(sh => sh.sheetID != sheetID)
    sheet.connected = sheet.connected.filter(value => value != token)

    console.log(printHeader + "Disconnecting")
    ws.send(JSON.stringify({valid: true}))

    if (sheet.connected.length == 0) {
        util.updateSheet(sheet.sheetData, savePath)
        delete sheets[sheetID]
    } else {
        // update range without last client
        for (const clientToken of sheet.connected) {
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
}