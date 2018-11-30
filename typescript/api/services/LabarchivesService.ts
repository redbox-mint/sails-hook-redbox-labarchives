import {Sails, Model} from 'sails';
import {Observable} from 'rxjs/Observable';
import * as requestPromise from 'request-promise';

import * as la from '@uts-eresearch/provision-labarchives';

import {Config} from '../Config';

import services = require('../core/CoreService');

declare var sails: Sails;
declare var WorkspaceService, _;

export module Services {

  export class LabarchivesService extends services.Services.Core.Service {
    protected config: Config;

    protected _exportedMethods: any = [
      'login',
      'insertNode',
      'addEntry'
    ];

    constructor() {
      super();
      this.config = new Config(sails.config.workspaces);
    }

    async login(key: any, username: string, password: string) {
      try {
        if (key && key['akid'] && key['password']) {
          return await la.accessInfo(key, username, password);
        } else {
          return Promise.reject(new Error('missing keys for accessing lab archives APIs'));
        }
      } catch (e) {
        return Promise.reject(new Error(e));
      }

    }

    async insertNode(key: any, userId: string, nbId: string, displayText) {
      try {
        if (key && key['akid'] && key['password']) {
          return await la.insertNode(key, userId, nbId, 0, displayText, false);
        } else {
          return Promise.reject(new Error('missing keys for accessing lab archives APIs'));
        }
      } catch (e) {
        return Promise.reject(new Error(e));
      }

    }

    async addEntry(key: any, userId: string, nbId: string, treeId: string, partType: string, metadata: string) {
      try {

        if (key && key['akid'] && key['password']) {
          return await la.addEntry(key, userId, nbId, treeId, partType, metadata);
        } else {
          return Promise.reject(new Error('missing keys for accessing lab archives APIs'));
        }
      } catch (e) {
        return Promise.reject(new Error(e));
      }

    }
  }
}
module.exports = new Services.LabarchivesService().exports();
