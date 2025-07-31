const fs = await import("node:fs")

export function join({
    ws, 
    token,
    sheet,
    client,
    sheetID, 
    printHeader,
    connections
}) {
    if (client.sheets.filter(sh => sh.sheetID == sheetID).length != 0) {
        console.log(printHeader + "Refused request")
        ws.send(JSON.stringify({
            valid: false,
            description: "Sheet aleady joined"
        }))
        return
    }

    client.sheets.push({
        sheetID: sheetID,
        selections: []
    })
    sheet.connected.push(token)

    console.log(printHeader + "Connecting")
    const selectionList = []
    for (const connectedToken of sheet.connected)
        if (connectedToken != token)
            connections[connectedToken].sheets.filter(sh => sh.sheetID == sheetID)[0]
                .selections.forEach(element => selectionList.push(element))
    ws.send(JSON.stringify({
        valid: true,
        sheet: sheet.sheetData,
        selections: selectionList
    }))
}

