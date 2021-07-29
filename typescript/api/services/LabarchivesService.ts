import {Sails, Model} from 'sails';
import * as la from '@uts-eresearch/provision-labarchives';

import {Config} from '../Config';
import {ExportConfig} from '../ExportConfig';

import services = require('../core/CoreService');
import axios from "axios";
import fs = require('fs');
import fse = require('fs-extra');
import path = require('path');

const FormData = require('form-data');

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
      'getNotebookTree',
      'createNotebook',
      'addUserToNotebook',
      'userHasEmail',
      'exportNotebook',
      'zipExport',
      'returnExport',
      'createDataRecord',
      'updateMeta',
      'saveDataStream',
      'listDataStream',
      'updateDataRecord'
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

    async createNotebook(key: any, userId: string, name: string) {
      try {
        if (key && key['akid'] && key['password']) {
          return await la.createNotebook(key, userId, name);
        } else {
          return Promise.reject(new Error('missing keys for accessing lab archives APIs'));
        }
      } catch (e) {
        return Promise.reject(new Error(e));
      }
    }

    async addUserToNotebook(key, uid, nbid, email, userRole) {
      try {
        if (key && key['akid'] && key['password']) {
          return await la.addUserToNotebook(key, uid, nbid, email, userRole);
        } else {
          return Promise.reject(new Error('missing keys for accessing lab archives APIs'));
        }
      } catch (e) {
        return Promise.reject(new Error(e));
      }
    }

    async userHasEmail(key: any, email: string) {
      try {
        if (key && key['akid'] && key['password']) {
          return await la.emailHasAccount(key, email);
        } else {
          return Promise.reject(new Error('missing keys for accessing lab archives APIs'));
        }
      } catch (e) {
        return Promise.reject(new Error(e));
      }
    }

    async exportNotebook(exportConfig: ExportConfig, uid: string, nbid: string) {
      try {
        const url = exportConfig.host + '/' + exportConfig.exportNotebook;
        sails.log.debug(uid);
        sails.log.debug(nbid);
        const response = await axios.post(url, {
          uid: uid, nbid: nbid
        }, {headers: exportConfig.headers});
        sails.log.debug(response);
        if (response['data']) {
          return response['data'];
        } else {
          return {error: true, errorMessage: response['error']}
        }
      } catch (e) {
        sails.log.debug(exportConfig.headers);
        return Promise.reject(new Error(e));
      }
    }

    async zipExport(exportConfig: ExportConfig, nbid: string) {
      try {
        const url = exportConfig.host + '/' + exportConfig.zipNotebook;
        sails.log.debug(url);
        sails.log.debug(nbid);
        const response = await axios.post(url, {
          notebookId: nbid
        }, {headers: exportConfig.headers});
        if (response['data']) {
          return response['data'];
        } else {
          return {error: true, errorMessage: response['error']}
        }
      } catch (e) {
        return Promise.reject(new Error(e));
      }
    }

    async returnExport(exportConfig: ExportConfig, nbid: string) {
      const url = exportConfig.host + '/' + exportConfig.returnNotebook;
      const outPath = path.join(exportConfig.exportDir, `${nbid}.zip`);
      const writer = fs.createWriteStream(outPath);
      return axios.post(url, {
        notebookId: nbid
      }, {responseType: 'stream', headers: exportConfig.headers})
        .then(response => {
          return new Promise((resolve, reject) => {
            response.data.pipe(writer);
            let error = null;
            writer.on('error', err => {
              error = err;
              writer.close();
              reject(err);
            });
            writer.on('close', () => {
              if (!error) {
                resolve(true);
              }
              //no need to call the reject here, as it will have been called in the
              //'error' stream;
            });
          });
        });
    }

    async createDataRecord(config: Config, username, metadata) {
      const createUrl = config.brandingAndPortalUrl + `/api/records/metadata/dataRecord`;
      const data = {
        "metadata": metadata,
        "workflowStage": "draft",
        "authorization": {
          "edit": [
            username
          ],
          "view": [
            username
          ],
          "editRoles": [
            "Admin", "Librarians"
          ],
          "viewRoles": [
            "Admin", "Librarians"
          ]
        }
      }
      const response = await axios({
        method: 'post',
        url: createUrl,
        headers: {
          'Authorization': config.authorization
        },
        data: data
      });
      sails.log.debug(response['data']);
      if (response['data'] && response['data']['oid']) {
        return {success: true, oid: response['data']['oid']};
      } else {
        return {error: true, errorMessage: response['message']};
      }
    }

    async updateMeta(config: Config, recordId: string, metaMetadata) {
      const updateMetaUrl = config.brandingAndPortalUrl + `/api/records/objectmetadata/${recordId}`;
      const response = await axios({
        method: 'put',
        url: updateMetaUrl,
        headers: {
          'Authorization': config.authorization
        },
        data: metaMetadata
      });
      sails.log.debug(response['data']);
      if (response['data']) {
        return {success: true};
      } else {
        return {error: true, errorMessage: response['message']};
      }
    }

    async saveDataStream(config: Config, exportConfig: ExportConfig, recordId: string, notebook_file: string, meta: any) {
      const filePath = path.join(exportConfig.exportDir, `${notebook_file}.zip`);
      const saveStreamUrl = config.brandingAndPortalUrl + `/api/records/datastreams/${recordId}`;
      const fileUpload = fs.createReadStream(filePath);
      const formData = new FormData();
      formData.append("attachmentFields", fileUpload);
      formData.append('isc', meta.isc);
      formData.append('type', 'attachment');
      const response = await axios({
        method: 'post',
        url: saveStreamUrl,
        headers: {
          'Authorization': config.authorization,
          ...formData.getHeaders()
        },
        data: formData
      });
      if (response['data']) {
        if (response['data']['message']) {
          const res = response['data']['message'];
          if (res['success']) {
            return {success: true, message: 'file uploaded', fileIds: res['fileIds']};
          } else {
            return {error: true, errorMessage: res['message']}
          }
        } else {
          return {error: true, errorMessage: response['message']}
        }
      } else {
        return {error: true, errorMessage: response['message']}
      }
    }

    async listDataStream(config: Config, recordId: string) {
      const saveStreamUrl = config.brandingAndPortalUrl + `/api/records/datastreams/${recordId}`;
      const response = await axios({
        method: 'put', // WHY is this put??? that is what's on the code, and the docos
        url: saveStreamUrl,
        headers: {
          'Authorization': config.authorization
        }
      });
      if (response['data']) {
        return {success: true, records: response['data']['records'], summary: response['data']['summary']}
      } else {
        return {error: true, errorMessage: response['message']}
      }
    }

    async updateDataRecord(config: Config, recordId: string, metadata: any) {
      const updateMetadataUrl = config.brandingAndPortalUrl + `/api/records/metadata/${recordId}`;
      const response = await axios({
        method: 'put',
        url: updateMetadataUrl,
        headers: {
          'Authorization': config.authorization,
          'Content-type': 'application/json'
        },
        data: metadata
      });
      if (response['data']) {
        return {success: true};
      } else {
        return {error: true, errorMessage: response['message']};
      }
    }

  }
}
module.exports = new Services.LabarchivesService().exports();
