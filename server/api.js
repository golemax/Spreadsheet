const path = await import("node:path")
const fs = await import("node:fs")

const {connect, connectionTokenLength} = await import("./requests/connect.js")
const {createSheet, sheetTokenLength} = await import("./requests/createSheet.js")
const {join} = await import("./requests/join.js")
const {leave} = await import("./requests/leave.js")
const {updateCellValue} = await import("./requests/updateCellValue.js")
const {updateSelected} = await import("./requests/updateSelected.js")

/**
 * @typedef {Object[]} connections - by token
 * @param {WebSocket} connections[].websocket
 * @param {Object[]} connections[].sheets
 * @param {String} connections[].sheets[].sheetID
 * @param {SheetRange[]} connections[].sheets[].selections
 */
const connections = {}

/**
 * @typedef {Object[]} sheets - by sheetID
 * @param {String[]} sheets[].connected
 * @param {Sheet} sheets[].sheetData
 */
const sheets = {}

const util = {
    existElementAssert: (printErrorHeader, ws, element, elementName) => {
        if (element == undefined) {
            console.log(printErrorHeader + "Invalid request")
            ws.send(JSON.stringify({error: "No given " + elementName}))
            return false
        }
        return true
    },

    stringElementAssert: (printErrorHeader, ws, element, elementName) => {
        if (!util.existElementAssert(printErrorHeader, ws, element, elementName)) return false

        if (typeof(element) !== "string") {
            console.log(printErrorHeader + "Invalid request")
            ws.send(JSON.stringify({error: elementName + " need to be a string"}))
            return false
        }
        return true
    },

    intElementAssert: (printErrorHeader, ws, element, elementName) => {
        if (!util.existElementAssert(printErrorHeader, ws, element, elementName)) return false

        if (typeof(element) !== "number" && parseInt(element) !== element) {
            console.log(printErrorHeader + "Invalid request")
            ws.send(JSON.stringify({error: elementName + " need to be a int"}))
            return false
        }
        return true
    },

    floatElementAssert: (printErrorHeader, ws, element, elementName) => {
        if (!util.existElementAssert(printErrorHeader, ws, element, elementName)) return false

        if (typeof(element) !== "number") {
            console.log(printErrorHeader + "Invalid request")
            ws.send(JSON.stringify({error: elementName + " need to be a float"}))
            return false
        }
        return true
    },

    booleanElementAssert: (printErrorHeader, ws, element, elementName) => {
        if (!util.existElementAssert(printErrorHeader, ws, element, elementName)) return false

        if (typeof(element) !== "boolean") {
            console.log(printErrorHeader + "Invalid request")
            ws.send(JSON.stringify({error: elementName + " need to be a boolean"}))
            return false
        }
        return true
    },

    objectElementAssert: (printErrorHeader, ws, element, elementName) => {
        if (!util.existElementAssert(printErrorHeader, ws, element, elementName)) return false

        if (typeof(element) !== "object") {
            console.log(printErrorHeader + "Invalid request")
            ws.send(JSON.stringify({error: elementName + " need to be a object"}))
            return false
        }
        return true
    },

    arrayElementAssert: (printErrorHeader, ws, element, elementName) => {
        if (!util.objectElementAssert(printErrorHeader, ws, element, elementName)) return false

        if (!Array.isArray(element)) {
            console.log(printErrorHeader + "Invalid request")
            ws.send(JSON.stringify({error: elementName + " need to be a array"}))
            return false
        }
        return true
    },
    
    validUID: (printErrorHeader, ws, uid, size, elementName) => {
        if (uid.length != size || ![...uid].every(v => {
            const code = v.codePointAt(0)
            return (code >= 48 && code <= 57) || // Uppercases alphabet
                (code >= 65 && code <= 90) // Number
        })) {
            console.log(printErrorHeader + "Invalid request")
            ws.send(JSON.stringify({
                valid: false,
                description: "Invalid " + elementName
            }))
            return false
        }
        return true
    },

    createToken: (length) =>
        [...Array(length)].map(() =>
        Math.floor(Math.random()*36).toString(36))
        .join("").toUpperCase(),

    updateSheet: (dataSheet, savePath) => {
        fs.writeFileSync(savePath, JSON.stringify(dataSheet, null, "  "))
    }
}

export function parse(ws, data, isBinary, url, printHeader, saveRoot) {
    const printErrorHeader = printHeader
    
    const args = {
        ws: ws, 
        util: util,
        sheets: sheets,
        saveRoot: saveRoot,
        connections: connections,
        printHeader: printHeader, 
        printErrorHeader: printErrorHeader
    }

    // require text request
    if (isBinary) {
        console.log(printErrorHeader + "Invalid request")
        ws.send(JSON.stringify({error: "JSON Object required"}))
        return
    }

    // Parse request as JSON
    let request
    try {
        request = JSON.parse(data.toString())
    } catch (e) {
        console.log(printErrorHeader + "Invalid request")
        ws.send(JSON.stringify({error: e.message}))
        return
    }
    args["request"] = request

    // Parse request's action
    const action = request.action
    if (!util.stringElementAssert(printErrorHeader, ws, action, "action")) return

    // Non-applicant requests
    switch (action) {
        case "connect":
            connect(args)
            return
    }

    // Parse request's token
    const token = request.token
    if (!util.stringElementAssert(printErrorHeader, ws, token, "token")) return
    if (!util.validUID(printErrorHeader, ws, token, connectionTokenLength, "token")) return
    if (!Object.keys(connections).includes(token)) {
        console.log(printErrorHeader + "Refused request")
        ws.send(JSON.stringify({
            valid: false,
            description: "Invalid token"
        }))
        return
    }
    const client = connections[token]
    args["token"] = token
    args["client"] = client
    
    printHeader += "[client: " + token + "] "
    args["printHeader"] = printHeader

    // Token applicant requests
    switch (action) {
        case "createSheet":
            createSheet(args)
            return
    }

    const sheetID = request.sheetID
    if (!util.stringElementAssert(printErrorHeader, ws, sheetID, "sheetID")) return
    if (!util.validUID(printErrorHeader, ws, sheetID, sheetTokenLength, "sheetID")) return
    const savePath = path.resolve(saveRoot, sheetID + ".json")
    args["savePath"] = savePath
    if (!Object.keys(sheets).includes(sheetID)) {
        if (fs.existsSync(savePath)) {
            // Load if exist in saves but not loaded
            sheets[sheetID] = {
                connected: [],
                sheetData: JSON.parse(fs.readFileSync(savePath))
            }
        } else {
            console.log(printErrorHeader + "Refused request")
            ws.send(JSON.stringify({
                valid: false,
                description: "Unexisting sheet"
            }))
            return
        }
    }
    const sheet = sheets[sheetID]
    args["sheetID"] = sheetID
    args["sheet"] = sheet

    printHeader += "[sheet: " + sheetID + "] "
    args["printHeader"] = printHeader

    // Token and sheet applicant requests
    switch (action) {
        case "join":
            join(args)
            return
        case "leave":
            leave(args)
            return
        case "updateCellValue":
            updateCellValue(args)
            return
        case "updateSelected":
            updateSelected(args)
            return
    }
    
    // Request unknow
    console.log(printErrorHeader + "Invalid request")
    ws.send(JSON.stringify({error: "Unknow action"}))
}

export function disconnect(ws, saveRoot) {
    const clientArray = Object.entries(connections).find(varr => varr[1].websocket == ws)
    const token = clientArray[0]
    const client = clientArray[1]
    for (const sheetClient of client.sheets) {
        const sheetID = sheetClient.sheetID
        const sheet = sheets[sheetID]
        sheet.connected = sheet.connected.filter(value => value != token)
        
        if (sheet.connected.length == 0) {
            util.updateSheet(sheet.sheetData, path.resolve(saveRoot, sheetID + ".json"))
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
    delete connections[token]
}