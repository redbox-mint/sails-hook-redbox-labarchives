"use strict";
exports.__esModule = true;
var ExportConfig = /** @class */ (function () {
    function ExportConfig(host, authorization, exportNotebook, zipNotebook, returnNotebook) {
        this.host = host;
        this.exportNotebook = exportNotebook;
        this.zipNotebook = zipNotebook;
        this.returnNotebook = returnNotebook;
        this.headers = {
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
            'Authorization': authorization
        };
    }
    return ExportConfig;
}());
exports.ExportConfig = ExportConfig;
