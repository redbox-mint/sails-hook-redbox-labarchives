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


  public async createRequest(request: any, rdmpId: string) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/labarchives/create';
    try {
      const result = await this.http.post(
        wsUrl,
        {request: request, rdmp: rdmpId},
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
