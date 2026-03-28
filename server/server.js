#!/usr/bin/env node

const fs = await import('fs');
const path = await import('path');
const http = await import('http');
const net = await import("node:net");
const ws = await import('ws');
const api = await import('./api.js')

// Get local IP from ifconfig.me (prefer secure)
async function getIP() {
    let ret = "localhost"
    try {
        ret = await (await fetch("https://ifconfig.me/ip")).text()
    } catch (e) {
        try {
            ret = await (await fetch("http://ifconfig.me/ip")).text()
        } catch (e) {
            console.log("Unable to get IP from ifconfig.me")
        }
    }
    return ret
}

// Prepare URL for secure file location
function securePath(url, rootFile) {
    return url
        .replaceAll(/^(?!\/)/g, "/")              // Be sure the path start with "/" (root)
        .replaceAll(/#.*$/g, "")                  // Remove fragment
        .replaceAll(/\?.*$/g, "")                 // Remove query
        .replaceAll(/[^a-zA-Z0-9\/%_.-]/g, "")    // Remove every unsuported caracters
        .replaceAll(/(?<=\/)\.\.?(?=\/|$)/g, "")  // Prevent relative paths ("/.." and "/.")
        .replaceAll(/\/+/g, "/")                  // Prevent duplicate slash
        .replaceAll(/^\/$/g, "/" + rootFile)      // Set default file as root
        .replaceAll(/\/$/g, "")                   // Remove last slash (to prevent confusions)
}

// Answer HTTP request
function answerFile(root, request, response) {

    request.url = secureUrl(request.url, "index.html")

    // fix redirections
    let url = "." + request.url
    url = url.replace(/^\.\/js\/common\//, "../common/")

    // get absolute path
    const filePath = path.resolve(root, url)

    // get file content
    let content
    try {
        content = fs.readFileSync(filePath)
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

// Manage Websocket Connection
function answerApi(ws, request, saveRoot) {
    console.log("client " + request.socket.remoteAddress + "\topen websocket connection at " + request.url);
    ws.on('message', (data, isBinary) => answerApiRequest(data, isBinary, ws, request, saveRoot))

    ws.on('close', () => {
        console.log("client " + request.socket.remoteAddress + "\tclose websocket connection from " + request.url)
        api.disconnect(ws, saveRoot)
    })
}

// Answer Websocket request
function answerApiRequest(data, isBinary, ws, request, saveRoot) {
    api.parse(
        ws, 
        data, 
        isBinary, 
        request.url, 
        "client " + request.socket.remoteAddress + "\tAPI> ", 
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
    const server = http.createServer((req, res) => answerFile(root, req, res))
    const wsServer = new ws.WebSocketServer({server: server})
    wsServer.on('connection', (ws, request) => answerApi(ws, request, saveRoot))
    
    // run server
    server.listen(port, () => console.log('Server running'));
})()