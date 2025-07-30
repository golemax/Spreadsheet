const {sheetTokenLenght} = await import("./createSheet.js")

export function leave(
    ws, 
    url, 
    util,
    token,
    sheets, 
    request, 
    sheetID, 
    address, 
    savePath, 
    printHeader, 
    connections)
{
    if (!util.stringElementAssert(sheetID)) return
    if (!util.validUID(sheetID, sheetTokenLenght, "sheetID")) return

    if (!Object.keys(sheets).includes(sheetID)) {
        console.log(printHeader + "Refused request")
        ws.send(JSON.stringify({
            valid: false,
            description: "This sheet didn't exist"
        }))
        return
    }

    if (connections[token].sheets.filter(sheet => sheet.sheet == sheetID).length == 0) {
        console.log(printHeader + "Refused request")
        ws.send(JSON.stringify({
            valid: false,
            description: "Sheet not joined"
        }))
        return
    }

    connections[token].sheets = connections[token].sheets.filter(sheet => sheet.sheet != sheetID)
    delete sheets[sheetID].connected[token]

    console.log(printHeader + "[sheet: " + sheetID + "] Disconnecting")
    ws.send(JSON.stringify({valid: true}))

    if (sheets[sheetID].connected.length == 0) {
        delete sheets[sheetID]
    }
}