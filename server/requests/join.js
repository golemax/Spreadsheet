const fs = await import("node:fs")

export function join(
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

    if (connections[token].sheets.filter(sheet => sheet.sheet == sheetID).length != 0) {
        console.log(printHeader + "Invalid request")
        ws.send(JSON.stringify({
            valid: false,
            description: "Sheet aleady joined"
        }))
        return
    }

    if (!Object.keys(sheets).includes(sheetID)) {
        if (fs.existsSync(savePath)) {
            if (fs.accessSync(savePath, fs.constants.R_OK | fs.constants.W_OK)) {
                sheets[sheetID] = {
                    connected: [],
                    sheetData: JSON.parse(fs.readFileSync(savePath))
                }
            } else {
                throw "Unable to read " + savePath
            }
        } else {
            console.log(printHeader + "Invalid request")
            ws.send(JSON.stringify({
                valid: false,
                description: "This sheet didn't exist"
            }))
            return
        }
    }

    connections[token].sheets.push({
        sheet: sheetID,
        selections: []
    })
    sheets[sheetID].connected.push(token)

    console.log(printHeader + "[sheet: " + sheetID + "] Connecting")
    ws.send(JSON.stringify({
        valid: true,
        sheet: sheets[sheetID].sheetData
    }))
}

