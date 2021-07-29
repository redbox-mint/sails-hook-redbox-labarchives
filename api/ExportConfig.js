"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ExportConfig {
    constructor(host, authorization, exportNotebook, zipNotebook, returnNotebook, exportDir) {
        this.host = host;
        this.exportNotebook = exportNotebook;
        this.zipNotebook = zipNotebook;
        this.returnNotebook = returnNotebook;
        this.exportDir = exportDir;
        this.headers = {
            'Content-Type': 'application/json',
            "Authorization": authorization
        };
    }
}
exports.ExportConfig = ExportConfig;
