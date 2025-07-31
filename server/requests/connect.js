export const connectionTokenLength = 16

export function connect({
    ws, 
    util,
    request, 
    address, 
    printHeader, 
    connections,
    printErrorHeader
}) {
    let token = util.createToken(connectionTokenLength)
    while (Object.keys(connections).includes(token))
        token = util.createToken(connectionTokenLength)
    connections[token] = {
        websocket: ws,
        sheets: []
    }
    console.log(printHeader + "New token: " + token)
    ws.send(JSON.stringify({token: token}))
    return token
}