const fs = await import("node:fs")

export function join({
    ws, 
    token,
    sheet,
    client,
    sheetID, 
    printHeader
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

    console.log(printHeader + "[sheet: " + sheetID + "] Connecting")
    ws.send(JSON.stringify({
        valid: true,
        sheet: sheet.sheetData
    }))
}

