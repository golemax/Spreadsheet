export const connectionTokenLenght = 16

export function connect(
    ws, 
    url, 
    util,
    request, 
    sheetID, 
    address, 
    printHeader, 
    connections)
{
    let token = util.createToken(connectionTokenLenght)
    while (Object.keys(connections).includes(token))
        token = util.createToken(connectionTokenLenght)
    connections[token] = {
        address: address,
        sheets: []
    }
    console.log(printHeader + "New token: " + token)
    ws.send(JSON.stringify({token: token}))
    return token
}