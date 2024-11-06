import {Sails, Model} from 'sails';

import * as la from '@researchdatabox/provision-labarchives';

import { Services as services } from '@researchdatabox/redbox-core-types';


declare var sails: Sails;
declare var WorkspaceService, _;

export module Services {

  export class LabarchivesService extends services.Core.Service {
    protected _exportedMethods: any = [
      'login',
      'userInfo',
      'insertNode',
      'addEntry',
      'getNotebookInfo',
      'getNotebookTree',
      'createNotebook',
      'addUserToNotebook',
      'userHasEmail'
    ];

    constructor() {
      super();
      this.logHeader = "LabArchivesService::"
    }

    async login(key: any, username: string, password: string) {
      try {
        if (key && key['akid'] && key['password']) {
          return await la.accessInfo(key, username, password);
        } else {
          sails.log.error(`Missing keys for LA api`);
          throw new Error('missing keys for accessing lab archives APIs');
        }
      } catch (e) {
        sails.log.error(`userHasEmail() -> Failed LA api call:`);
        sails.log.error(e);
        throw new Error(e);
      }

    }

    async userInfo(key: any, userId: string) {
      try {
        if (key && key['akid'] && key['password']) {
          return await la.userInfoViaId(key, userId);
        } else {
          sails.log.error(`Missing keys for LA api`);
          throw new Error('missing keys for accessing lab archives APIs');
        }
      } catch (e) {
        sails.log.error(`userHasEmail() -> Failed LA api call:`);
        sails.log.error(e);
        throw new Error(e);
      }

    }

    async insertNode(key: any, userId: string, nbId: string, displayText) {
      try {
        if (key && key['akid'] && key['password']) {
          return await la.insertNode(key, userId, nbId, 0, displayText, false);
        } else {
          sails.log.error(`Missing keys for LA api`);
          throw new Error('missing keys for accessing lab archives APIs');
        }
      } catch (e) {
        sails.log.error(`userHasEmail() -> Failed LA api call:`);
        sails.log.error(e);
        throw new Error(e);
      }

    }

    async addEntry(key: any, userId: string, nbId: string, treeId: string, partType: string, metadata: string) {
      try {

        if (key && key['akid'] && key['password']) {
          return await la.addEntry(key, userId, nbId, treeId, partType, metadata);
        } else {
          sails.log.error(`Missing keys for LA api`);
          throw new Error('missing keys for accessing lab archives APIs');
        }
      } catch (e) {
        sails.log.error(`userHasEmail() -> Failed LA api call:`);
        sails.log.error(e);
        throw new Error(e);
      }

    }

    async getNotebookInfo(key: any, userId: string, nbId: string) {
      try {
        if (key && key['akid'] && key['password']) {
          return await la.getNotebookInfo(key, userId, nbId);
        } else {
          sails.log.error(`Missing keys for LA api`);
          throw new Error('missing keys for accessing lab archives APIs');
        }
      } catch (e) {
        sails.log.error(`userHasEmail() -> Failed LA api call:`);
        sails.log.error(e);
        throw new Error(e);
      }
    }

    async getNotebookTree(key: any, userId: string, nbId: string, treeLevel: number = 0) {
      try {
        if (key && key['akid'] && key['password']) {
          return await la.getTree(key, userId, nbId, treeLevel);
        } else {
          sails.log.error(`Missing keys for LA api`);
          throw new Error('missing keys for accessing lab archives APIs');
        }
      } catch (e) {
        sails.log.error(`userHasEmail() -> Failed LA api call:`);
        sails.log.error(e);
        throw new Error(e);
      }
    }

    async createNotebook(key: any, userId: string, name: string) {
      try {
        if (key && key['akid'] && key['password']) {
          return await la.createNotebook(key, userId, name);
        } else {
          sails.log.error(`Missing keys for LA api`);
          throw new Error('missing keys for accessing lab archives APIs');
        }
      } catch (e) {
        sails.log.error(`userHasEmail() -> Failed LA api call:`);
        sails.log.error(e);
        throw new Error(e);
      }
    }

    async addUserToNotebook(key, uid, nbid, email, userRole) {
      try {
        if (key && key['akid'] && key['password']) {
          return await la.addUserToNotebook(key, uid, nbid, email, userRole);
        } else {
          sails.log.error(`Missing keys for LA api`);
          throw new Error('missing keys for accessing lab archives APIs');
        }
      } catch (e) {
        sails.log.error(`userHasEmail() -> Failed LA api call:`);
        sails.log.error(e);
        throw new Error(e);
      }
    }

    async userHasEmail(key: any, email: string) {
      try {
        if (key && key['akid'] && key['password']) {
          const response = await la.emailHasAccount(key, email);
          return response;
        } else {
          sails.log.error(`Missing keys for LA api`);
          throw new Error('missing keys for accessing lab archives APIs');
        }
      } catch (e) {
        sails.log.error(`userHasEmail() -> Failed LA api call:`);
        sails.log.error(e);
        throw new Error(e);
      }
    }

  }
}
module.exports = new Services.LabarchivesService().exports();
