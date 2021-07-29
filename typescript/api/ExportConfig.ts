export class ExportConfig {
  host: string;
  exportNotebook: string;
  zipNotebook: string;
  returnNotebook: string;
  exportDir: string;
  headers: any;

  constructor(host, authorization, exportNotebook, zipNotebook, returnNotebook, exportDir) {

    this.host = host;
    this.exportNotebook = exportNotebook;
    this.zipNotebook = zipNotebook;
    this.returnNotebook = returnNotebook;
    this.exportDir = exportDir;
    this.headers = {
      'Content-Type': 'application/json',
      "Authorization": authorization //Add 'Bearer ' to this string
    };
  }
}
