(async () => {
    const sheet = await import("./common/sheet.js")
    const draw = await import("./draw.js")
    const control = await import("./control.js")

    /**
     * Create new global table linked to a div
     * @param {HTMLDivElement} rootElement
     */
    async function initSheet(rootElement) {
        /** @type {ClientSheet} */
        const clientSheet = {}
        clientSheet.element = rootElement
        clientSheet.token = null
        clientSheet.server = null
        clientSheet.otherSelections = []
        clientSheet.context = rootElement.getElementsByTagName("canvas")[0].getContext("2d")
        clientSheet.state = {
            xOffset: 0,
            yOffset: 0,
            menu: null,

            selection: [{
                startColumn: 1,
                startRow: 1,
                endColumn: 1,
                endRow: 1
            }],
            actualSelection: 0,
            selectionOffsetX: 0,
            selectionOffsetY: 0,

            xStartDraggingCell: null,
            yStartDraggingCell: null,

            firstVisibleColumn: 1,
            firstVisibleRow: 1,
            firstVisibleColumnOffset: 0,
            firstVisibleRowOffset: 0
        }

        const ws = await promiseConnectWebsocket(window.location.href)
        window.addEventListener("beforeunload", () => new WebSocket().close())
        const token = (await promiseRespondWebsocket(ws, {action: "connect"})).token
        const sheetConnectionInit = await promiseRespondWebsocket(ws, {
            action: "createSheet",
            token: token
        })

        const sheetID = sheetConnectionInit.sheetID
        clientSheet.sheet = sheetConnectionInit.sheet

        control.initControl(clientSheet)
        
        globalThis.spreadsheet ??= []
        globalThis.spreadsheet.push(clientSheet)

        draw.animationLoop()
    }

    Array.from(document.getElementsByClassName("sheet")).forEach(element => initSheet(element))
})()

function promiseConnectWebsocket(address) {
    const ws = new WebSocket(address)
    return new Promise((resolve) => {
        ws.onopen = (e) => {
            resolve(ws)
        }
    })
}

function promiseRespondWebsocket(ws, request) {
    return new Promise((resolve) => {
        ws.onmessage = result => {
            resolve(JSON.parse(result.data))
        }
        ws.send(JSON.stringify(request))
    })
}