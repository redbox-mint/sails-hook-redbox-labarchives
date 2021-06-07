export class ExportConfig {
  host: string;
  url: string;
  headers: any;

  constructor(host, url, authorization) {

    this.host = host;
    this.url = url;
    this.headers = {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json',
      'Authorization': authorization
    };


  }
}
