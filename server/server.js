#!/usr/bin/env node

const fs = await import('fs');
const path = await import('path');
const http = await import('http');
const net = await import("node:net");
const ws = await import('ws');
const api = await import('./api.js')

async function getIP() {
    let ret = "localhost"
    try {
        ret = await (await fetch("https://ifconfig.me/ip")).text()
    } catch (e) {
        console.log("Unable to get IP from ifconfig.me")
    }
    return ret
}

function secureUrl(url) {
    /*
        Prepare URL for secure file location
        All selected patterns change to "/" for correcting URLs
        (^(?!\/)) => Prevent path than don't start with root "/"
        ((?<=\/|^)\.\.(?=\/|$)) => Prevent relative path
        (pattern|(\/))+ => Prevent duplication of file separator "/"
        */
    return url.replaceAll(/((^(?!\/))|((?<=\/|^)\.\.(?=\/|$))|(\/))+/g, "/")
}

// Answer HTTP request
function answerFile(root, request, response) {

    request.url = secureUrl(request.url)

    if (request.url.endsWith("/"))
        request.url += "index.html"; // set index.html as default

    // fix redirections
    let url = "." + request.url
    url = url.replace(/\.\/js\/common\//, "../common/")

    // get absolute path
    const filePath = path.resolve(root, url)

    // get file content
    try {
        const content = fs.readFileSync(filePath)
    } catch(_) {
        console.log("client " + request.socket.remoteAddress + "\trequested " + request.url + " (not exist)");
        response.setHeader("Content-Type", "text/plain");
        response.end("File not found");
        return
    }

    // add MIME type by extention
    console.log("client " + request.socket.remoteAddress + "\trequested " + request.url);
    const filename = url.split("/").at(-1)
    if (filename.includes(".")) {
        const extension = filename.split(".").at(-1)
        switch (extension) {
            case "txt":
                response.setHeader("Content-Type", "text/plain");
                break;
            case "html":
                response.setHeader("Content-Type", "text/html");
                break;
            case "js":
                response.setHeader("Content-Type", "text/javascript");
                break;
            case "css":
                response.setHeader("Content-Type", "text/css");
                break;
            case "json":
                response.setHeader("Content-Type", "text/json");
                break;
        }
    }

    // send datas
    response.end(content);
}

// Manage Websocket connection
function answerApiConnection(ws, request) {
    console.log("client " + request.socket.remoteAddress + "\topen websocket connection at " + request.url);
    ws.on('message', answerApi)

    ws.on('close', () => {console.log("client " + request.socket.remoteAddress + "\tclose websocket connection from " + request.url)})
}

// Answer Websocket request
function answerApi(data, isBinary) {
    api.parse(
        ws, 
        data, 
        isBinary, 
        request.url, 
        "client " + request.socket.remoteAddress + "\tAPI> ", 
        request.socket.remoteAddress, 
        saveRoot)
}

(async() => {

    // set root location
    let rootDir = process.cwd()
    if (typeof __dirname !== 'undefined') {
        rootDir = __dirname;
        console.log("Location fixed");
    }

    // init some variables
    const ip = await getIP()
    const port = 80
    const clientFolder = "./client/";
    const savesFolder = "./saves/";

    // print server info
    console.log("Server IP: http://" + (net.isIPv6(ip) ? "[" + ip + "]" : ip) + ((port === 80) ? "" : ":" + port));
    console.log("Local server IP: http://localhost" + ((port === 80) ? "" : ":" + port));

    // init some path
    const root = path.join(rootDir, clientFolder)
    const saveRoot = path.join(rootDir, savesFolder)

    // init server
    const server = http.createServer((req, res) => answer(root, req, res))
    const wsServer = new ws.WebSocketServer({server: server})
    wsServer.on('connection', answerApiConnection)
    
    // run server
    server.listen(port, () => console.log('Server running'));
})()