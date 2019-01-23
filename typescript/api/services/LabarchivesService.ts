import {Sails, Model} from 'sails';

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
      'userInfo',
      'insertNode',
      'addEntry',
      'getNotebookInfo',
      'getNotebookTree'
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
    async userInfo(key: any, userId: string) {
      try {
        if (key && key['akid'] && key['password']) {
          return await la.userInfoViaId(key, userId);
        } else {
          return Promise.reject(new Error('missing keys for accessing lab archives APIs'));
        }
      } catch (e) {
        return Promise.reject(new Error(e));
      }

    }

    userInfoViaId
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

    async getNotebookInfo(key: any, userId: string, nbId: string) {
      try {
        if (key && key['akid'] && key['password']) {
          return await la.getNotebookInfo(key, userId, nbId);
        } else {
          return Promise.reject(new Error('missing keys for accessing lab archives APIs'));
        }
      } catch (e) {
        return Promise.reject(new Error(e));
      }
    }

    async getNotebookTree(key: any, userId: string, nbId: string, treeLevel: number = 0) {
      try {
        if (key && key['akid'] && key['password']) {
          return await la.getTree(key, userId, nbId, treeLevel);
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
