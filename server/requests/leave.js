const {sheetTokenLength} = await import("./createSheet.js")

export function leave({
    ws, 
    token,
    sheet,
    client,
    sheets, 
    sheetID, 
    printHeader
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
    delete sheet.connected[token]

    console.log(printHeader + "Disconnecting")
    ws.send(JSON.stringify({valid: true}))

    if (sheet.connected.length == 0) {
        delete sheets[sheetID]
    }
}