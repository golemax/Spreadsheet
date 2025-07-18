#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const net = require("node:net");

async function getIP() {
    let ret = "localhost"
    try {
        ret = await (await fetch("https://ifconfig.me/ip")).text()
    } catch (e) {
        console.log("Unable to get IP from ifconfig.me")
    }
    return ret
}

/**
 * @param {string} root
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 */
function answer(root, request, response) {

    /*
        Prepare URL for secure file location
        All selected patterns change to "/" for correcting URLs
        (^(?!\/)) => Prevent path than don't start with root "/"
        ((?<=\/|^)\.\.(?=\/|$)) => Prevent relative path
        (pattern|(\/))+ => Prevent duplication of file separator "/"
        */
    request.url = request.url.replaceAll(/((^(?!\/))|((?<=\/|^)\.\.(?=\/|$))|(\/))+/g, "/")

    if (request.url.endsWith("/"))
        request.url += "index.html"; // set index.html as default

    const url = "." + request.url;

    fs.promises.readFile(path.resolve(root, url)).then(content => {
        console.log("client " + request.socket.remoteAddress + "\trequested " + url);
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
        response.end(content);
    }).catch(() => {
        console.log("client " + request.socket.remoteAddress + "\trequested " + url + " (not exist)");
        response.setHeader("Content-Type", "text/plain");
        response.end("File not found");
    })
}

(async() => {

    let rootDir = process.cwd()

    if (typeof __dirname !== 'undefined') {
        rootDir = __dirname;
        console.log("Location fixed");
    }

    const ip = await getIP()
    const port = 80
    const clientFolder = "./client/";

    console.log("Server IP: http://" + (net.isIPv6(ip) ? "[" + ip + "]" : ip) + ((port === 80) ? "" : ":" + port));
    console.log("Local server IP: http://localhost" + ((port === 80) ? "" : ":" + port));

    const root = path.join(rootDir, clientFolder)
    const server = http.createServer((req, res) => answer(root, req, res))

    server.listen(port, () => console.log('Server running'));
})()