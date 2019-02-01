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

}
