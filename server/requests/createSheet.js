const fs = await import("node:fs")
const sheetJS = await import("../../common/sheet.js")

export const sheetTokenLength = 8

export function createSheet({
    ws, 
    util,
    token,
    client,
    sheets, 
    request, 
    saveRoot, 
    printHeader, 
    connections,
    printErrorHeader
}) {
    let sheetID = util.createToken(sheetTokenLength)
    while (Object.keys(sheets).includes(sheetID) && fs.readdirSync(saveRoot).includes(sheetID + ".json"))
        sheetID = util.createToken(sheetTokenLength)

    sheets[sheetID] = {
        connected: [token],
        sheetData: sheetJS.newSheet(true)
    }
    client.sheets.push({
        sheet: sheetID,
        selections: []
    })

    console.log(printHeader + "New sheet: " + sheetID)
    console.log(printHeader + "[sheet: " + sheetID + "] Connecting")
    ws.send(JSON.stringify({
        valid: true,
        sheetID: sheetID,
        sheet: sheets[sheetID].sheetData
    }))
}