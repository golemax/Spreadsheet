const path = await import("node:path")

const {connect, connectionTokenLength} = await import("./requests/connect.js")
const {join} = await import("./requests/join.js")
const {leave} = await import("./requests/leave.js")
const {createSheet, sheetTokenLength} = await import("./requests/createSheet.js")

const connections = {}
const sheets = {}

const util = {
    stringElementAssert: (printErrorHeader, ws, element, elementName) => {
        if (element === undefined) {
            console.log(printErrorHeader + "Invalid request")
            ws.send(JSON.stringify({error: "No given " + elementName}))
            return false
        }

        if (typeof(element) !== "string") {
            console.log(printErrorHeader + "Invalid request")
            ws.send(JSON.stringify({error: elementName + " need to be a string"}))
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
        .join("").toUpperCase()
}

export function parse(ws, data, isBinary, url, printHeader, address, saveRoot) {
    const printErrorHeader = printHeader
    
    const args = {
        ws: ws, 
        util: util,
        sheets: sheets,
        address: address, 
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
    if (!util.stringElementAssert(printErrorHeader, ws, action)) return

    // Give a token if requested (every others request require connection)
    if (action === "connect") {
        const token = connect(args)
        return
    }

    // Parse request's token
    const token = request.token
    if (!util.stringElementAssert(printErrorHeader, ws, token)) return
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

    // Create a sheet requested (every others request require existing sheet)
    if (action == "createSheet") {
        createSheet(args)
    }

    const sheetID = request.sheetID
    if (!util.stringElementAssert(printErrorHeader, ws, sheetID)) return
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

    // Run actions with client token
    switch (action) {
        case "join":
            join(args)
            break
        case "leave":
            leave(args)
            break
        default:
            console.log(printErrorHeader + "Invalid request")
            ws.send(JSON.stringify({error: "Unknow action"}))
    }
}