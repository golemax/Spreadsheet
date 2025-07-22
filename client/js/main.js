(async () => {
    const sheet = await import("./sheet/sheet.js")
    const draw = await import("./draw.js")
    const control = await import("./control.js")

    /**
     * Create new global table linked to a div
     * @param {HTMLDivElement} rootElement
     */
    function initSheet(rootElement) {
        /** @type {ClientSheet} */
        const clientSheet = {}
        clientSheet.element= rootElement
        clientSheet.sheet = sheet.newSheet(true)
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

        control.initControl(clientSheet)
        
        globalThis.spreadsheet ??= []
        globalThis.spreadsheet.push(clientSheet)

        draw.animationLoop()
    }

    Array.from(document.getElementsByClassName("sheet")).forEach(element => initSheet(element))
})()