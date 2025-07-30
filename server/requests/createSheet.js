const fs = await import("node:fs")
const sheetJS = await import("../../common/sheet.js")

export const sheetTokenLenght = 8

export function createSheet(
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
    sheetID = util.createToken(sheetTokenLenght)
    while (Object.keys(sheets).includes(sheetID))
        sheetID = util.createToken(sheetTokenLenght)

    if (fs.existsSync(savePath)) {
        console.log(printHeader + "Invalid request")
        ws.send(JSON.stringify({
            valid: false,
            description: "This sheet already't exist"
        }))
        return
    }

    sheets[sheetID] = {
        connected: [token],
        sheetData: sheetJS.newSheet(true)
    }
    connections[token].sheets.push({
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