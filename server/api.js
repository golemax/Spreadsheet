const path = await import("node:path")

const {connect, connectionTokenLenght} = await import("./requests/connect.js")
const {join} = await import("./requests/join.js")
const {leave} = await import("./requests/leave.js")
const {createSheet} = await import("./requests/createSheet.js")

const connections = {}
const sheets = {}

const util = {
    stringElementAssert: (element, elementName) => {
        if (element === undefined) {
            console.log(printHeader + "Invalid request")
            ws.send(JSON.stringify({error: "No given " + elementName}))
            return false
        }

        if (typeof(element) !== "string") {
            console.log(printHeader + "Invalid request")
            ws.send(JSON.stringify({error: elementName + " need to be a string"}))
            return false
        }
        return true
    },
    
    validUID: (uid, lenght, elementName) => {
        if (uid.lenght != lenght || ![...uid].every(v => {
            const code = v.codePointAt(0)
            return (code >= 48 && code <= 57) || // Uppercases alphabet
                (code >= 65 && code <= 90) // Number
        })) {
            console.log(printHeader + "Invalid request")
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

    // require text request
    if (isBinary) {
        console.log(printHeader + "Invalid request")
        ws.send(JSON.stringify({error: "JSON Object required"}))
        return
    }

    // Parse request as JSON
    let request
    try {
        request = JSON.parse(data.toString())
    } catch (e) {
        console.log(printHeader + "Invalid request")
        ws.send(JSON.stringify({error: e.message}))
        return
    }

    // Parse request's action
    const action = request.action
    if (!stringElementAssert(action)) return

    // Give a token if requested (every others request require connection)
    if (action === "connect") {
        const token = connect(
            ws, 
            url, 
            util,
            request, 
            sheetID, 
            address, 
            printHeader, 
            connections)
        return
    }

    // Parse request's token
    const token = request.token
    if (!stringElementAssert(token)) return
    if (!validUID(token, connectionTokenLenght, "token"))

    if (!Object.keys(connections).includes(token)) {
        console.log(printHeader + "Invalid request")
        ws.send(JSON.stringify({
            valid: false,
            description: "Invalid token"
        }))
        return
    }

    printHeader += "[client: " + token + "] "

    // Run actions with client token
    let sheetID = request.sheetID
    const savePath = path.resolve(saveRoot, sheetID + ".json")
    const args = [
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
        connections
    ]
    switch (action) {
        case "join":
            join(...args)
            break
        case "leave":
            leave(...args)
            break
        case "createSheet":
            createSheet(...args)
            break
        default:
            ws.send(JSON.stringify({error: "Unknow action"}))
    }
}