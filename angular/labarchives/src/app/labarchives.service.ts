import {Injectable, Inject} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Http} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/delay';
import {Observable} from 'rxjs/Observable';

import {BaseService} from './shared/base-service';
import {ConfigService} from './shared/config-service';

@Injectable()
export class LabarchivesService extends BaseService {

  protected baseUrl: any;
  public recordURL: string = this.brandingAndPortalUrl + '/record/view';
  protected initSubject: any;

  constructor(@Inject(Http) http: Http,
              @Inject(ConfigService) protected configService: ConfigService) {
    super(http, configService);
    this.initSubject = new Subject();
    this.emitInit();
  }

  public waitForInit(handler: any) {
    const subs = this.initSubject.subscribe(handler);
    this.emitInit();
    return subs;
  }

  public emitInit() {
    if (this.brandingAndPortalUrl) {
      this.initSubject.next('');
    }
  }

  public async info() {
    const wsUrl = this.brandingAndPortalUrl + '/ws/labarchives/info';
    try {
      const result = await this.http.get(
        wsUrl,
        this.options
      ).toPromise();
      return Promise.resolve(this.extractData(result));
    } catch (e) {
      return Promise.reject(new Error(e));
    }
  }

  public async login(username, password) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/labarchives/login';
    try {
      const result = await this.http.post(
        wsUrl,
        {username: username, password: password},
        this.options
      ).toPromise();
      return Promise.resolve(this.extractData(result));
    } catch (e) {
      return Promise.reject(new Error(e));
    }
  }

  public async list() {
    const wsUrl = this.brandingAndPortalUrl + '/ws/labarchives/list';
    try {
      const result = await this.http.get(
        wsUrl,
        this.options
      ).toPromise();
      return Promise.resolve(this.extractData(result));
    } catch (e) {
      return Promise.reject(new Error(e));
    }
  }

  public async link(workspace: any, rdmpId: string) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/labarchives/link';
    try {
      const result = await this.http.post(
        wsUrl,
        {rdmp: rdmpId, workspace: workspace},
        this.options
      ).toPromise();
      return Promise.resolve(this.extractData(result));
    } catch (e) {
      return Promise.reject(new Error(e));
    }
  }

  public async checkLink(rdmpId: string, nbId: string) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/labarchives/checkLink';
    try {
      const result = await this.http.post(
        wsUrl,
        {rdmp: rdmpId, nbId: nbId},
        this.options
      ).toPromise();
      return Promise.resolve(this.extractData(result));
    } catch (e) {
      return Promise.reject(new Error(e));
    }
  }

  public async getUserInfo() {
    const wsUrl = this.brandingAndPortalUrl + '/user/info';
    try {
      const result = await this.http.get(
        wsUrl,
        this.options
      ).toPromise();
      return Promise.resolve((this.extractData(result)));
    } catch (e) {
      return Promise.reject(new Error(e));
    }
  }

  public async createNotebook(rdmp: string, nbName: string, supervisorEmail: string, userEmail: string) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/labarchives/create';
    try {
      const result = await this.http.post(
        wsUrl,
        {name: nbName, supervisor: supervisorEmail, rdmp: rdmp, userEmail: userEmail},
        this.options
      ).toPromise();
      return Promise.resolve((this.extractData(result)));
    } catch (e) {
      return Promise.reject(new Error(e));
    }
  }

  public async rdmpInfo(rdmp: string) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/labarchives/rdmp';
    try {
      const result = await this.http.post(
        wsUrl,
        {rdmp: rdmp},
        this.options
      ).toPromise();
      return Promise.resolve((this.extractData(result)));
    } catch (e) {
      return Promise.reject(new Error(e));
    }
  }

  public async findNotebook(rdmp: string, workspace: string) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/labarchives/findNotebook';
    try {
      console.log('requesting this: ' + workspace);
      const result = await this.http.post(
        wsUrl,
        {rdmp: rdmp, workspace: workspace},
        this.options
      ).toPromise();
      return Promise.resolve((this.extractData(result)));
    } catch (e) {
      return Promise.reject(new Error(e));
    }
  }

  public async notebookInfo(rdmp: string, notebook: string) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/labarchives/notebook';
    try {
      console.log('requesting this: ' + notebook);
      const result = await this.http.post(
        wsUrl,
        {rdmp: rdmp, notebook: notebook},
        this.options
      ).toPromise();
      return Promise.resolve((this.extractData(result)));
    } catch (e) {
      return Promise.reject(new Error(e));
    }
  }

  public async exportNotebook(rdmp: string, notebook: string) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/labarchives/export';
    try {
      const result = await this.http.post(
        wsUrl,
        {rdmp: rdmp, notebook: notebook},
        this.options
      ).toPromise();
      return Promise.resolve((this.extractData(result)));
    } catch (e) {
      return Promise.reject(new Error(e));
    }
  }

  public async zipNotebook(notebook: string) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/labarchives/zipExport';
    try {
      const result = await this.http.post(
        wsUrl,
        {notebook: notebook},
        this.options
      ).toPromise();
      return Promise.resolve((this.extractData(result)));
    } catch (e) {
      return Promise.reject(new Error(e));
    }
  }

  public async checkExport(workspace: any) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/labarchives/checkExport';
    try {
      const result = await this.http.post(
        wsUrl,
        {workspace: workspace},
        this.options
      ).toPromise();
      return Promise.resolve((this.extractData(result)));
    } catch (e) {
      return Promise.reject(new Error(e));
    }
  }

  public async returnNotebook(notebook: string) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/labarchives/returnExport';
    try {
      const result = await this.http.post(
        wsUrl,
        {notebook: notebook},
        this.options
      ).toPromise();
      return Promise.resolve((this.extractData(result)));
    } catch (e) {
      return Promise.reject(new Error(e));
    }
  }

  public async createDataRecord(
    rdmp, rdmpTitle, isHdr, notebookFile, notebookTitle,
    retention, disposal, isc,
    contributor_ci, contributor_data_manager, keywords) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/labarchives/createDataRecord';
    try {
      const result = await this.http.post(
        wsUrl,
        {
          rdmp, rdmpTitle, isHdr, notebookFile, notebookTitle,
          retention, disposal, isc,
          contributor_ci, contributor_data_manager, keywords
        },
        this.options
      ).toPromise();
      return Promise.resolve((this.extractData(result)));
    } catch (e) {
      return Promise.reject(new Error(e));
    }
  }
}
