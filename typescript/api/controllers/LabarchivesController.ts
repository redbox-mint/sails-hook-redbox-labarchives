declare var module;
declare var sails, Model;
declare var _;

import {Observable} from 'rxjs';
import 'rxjs/add/operator/map';

declare var BrandingService, WorkspaceService, LabarchivesService;
/**
 * Package that contains all Controllers.
 */
import controller = require('../core/CoreController');
import {Config} from '../Config';
import {UserInfo} from "../UserInfo";

export module Controllers {

  /**
   * Omero related features....
   *
   */
  export class LabarchivesController extends controller.Controllers.Core.Controller {

    protected _exportedMethods: any = [
      'info',
      'login',
      'link',
      'checkLink',
      'list'
    ];
    _config: any;

    protected config: Config;

    constructor() {
      super();
      this.config = new Config(sails.config.workspaces);
    }

    public info(req, res) {
      this.config.brandingAndPortalUrl = BrandingService.getFullPath(req);
      this.ajaxOk(req, res, null, {location: this.config.location, status: true});
    }

    login(req, res) {
      const user = {
        username: req.param('username'),
        password: req.param('password')
      };
      if (user.username && user.password) {
        let info = {};
        const userId = req.user.id;
        this.config.brandingAndPortalUrl = BrandingService.getFullPath(req);
        const userInfo = LabarchivesService.login(this.config.key, user.username, user.password);
        Observable.fromPromise(userInfo).flatMap(response => {
          const userInfo = response['users'];
          if (userInfo) {
            info = new UserInfo(userInfo['id'], userInfo['orcid'], userInfo['fullname']);
            return WorkspaceService.workspaceAppFromUserId(userId, this.config.appName);
          } else {
            //Doing this because if the password is incorrect labarchives returns a 404!
            const message = 'username and password invalid';
            throw new Error(message);
          }
        }).flatMap(response => {
          if (response && response['id']) {
            return WorkspaceService.updateWorkspaceInfo(response['id'], info);
          } else {
            return WorkspaceService.createWorkspaceInfo(userId, this.config.appName, info);
          }
        }).subscribe(response => {
          this.ajaxOk(req, res, null, {status: true, login: true});
        }, error => {
          const errorMessage = `Failed to login for user ${user.username}`;
          sails.log.error(error);
          this.ajaxFail(req, res, errorMessage, {status: false, message: errorMessage});
        });
      }
      else {
        const message = 'Input username and password';
        this.ajaxFail(req, res, message, {status: false, message: message});
      }
    }

    list(req, res) {
      sails.log.debug('list');
      const userId = req.user.id;
      this.config.brandingAndPortalUrl = BrandingService.getFullPath(req);
      let info = {};
      return WorkspaceService.workspaceAppFromUserId(userId, this.config.appName)
        .flatMap(response => {
          const user = response['info'] || null;
          if (user) {
            const userInfo = LabarchivesService.userInfo(this.config.key, user['id'], true);
            return Observable.fromPromise(userInfo);
          } else {
            return Observable.throwError('cannot get user info');
          }
        })
        .subscribe(response => {
          const notebooks = response['users']['notebooks'];
          this.ajaxOk(req, res, null, {status: true, notebooks: notebooks, message: 'list'});
        }, error => {
          sails.log.error('list: error');
          sails.log.error(error);
          this.ajaxFail(req, res, error.message, {status: false, message: error.message});
        });
    }

    link(req, res) {
      const userId = req.user.id;
      const username = req.user.username;

      this.config.brandingAndPortalUrl = BrandingService.getFullPath(req);

      const rdmp = req.param('rdmp');
      const notebook = req.param('workspace');
      if (!notebook || !rdmp) {
        const message = 'rdmp, notebook are missing';
        this.ajaxFail(req, res, message, {status: false, message: message});
        return;
      }
      const nbId = notebook['id'];
      const nbName = notebook['name'];
      sails.log.debug('notebook: ' + nbId);
      sails.log.debug('name: ' + nbName);
      if (!nbId || !nbName) {
        const message = 'notebook or notebook name are missing';
        this.ajaxFail(req, res, message, {status: false, message: message});
        return;
      }
      let info = {};
      let workspace: any = null;
      let metadataContent = '';
      let rdmpTitle = '';
      let recordMetadata = null;

      WorkspaceService.getRecordMeta(this.config, rdmp)
        .flatMap(response => {
          sails.log.debug('recordMetadata');
          recordMetadata = response;
          rdmpTitle = recordMetadata.title;
          return WorkspaceService.workspaceAppFromUserId(userId, this.config.appName)
        })
        .flatMap(response => {
          info = response.info;
          const record = {
            rdmpOid: rdmp,
            rdmpTitle: rdmpTitle,
            title: nbName,
            location: this.config.location, //`https://au-mynotebook.labarchives.com`,
            description: this.config.description, //'LabArchives Workspace',
            type: this.config.recordType
          };
          return WorkspaceService.createWorkspaceRecord(
            this.config, username, record, this.config.recordType, this.config.workflowStage
          );
        })
        .flatMap(response => {
          workspace = response;
          const insertNode = LabarchivesService.insertNode(this.config.key, info['id'], nbId, 'stash.workspace', false);
          return Observable.fromPromise(insertNode);

        })
        .flatMap(response => {
          if (response && response['tree-tools']) {
            const tree = response['tree-tools'];
            const node = tree['node'];
            metadataContent = `
          <div id="${workspace.oid}">      
            <h1>UTS</h1>             
            <h3>Workspace <strong>${nbName}</strong> is linked to:</h3>                       
            <h2>Research Data Management Plan <a href="${this.config.brandingAndPortalUrl}/record/view/${rdmp}">${rdmpTitle}</a></h2>            
            <p>Stash Id: ${workspace.oid}</p>   
          </div>
          `;
            const partType = 'text entry';
            const insertNode = LabarchivesService.addEntry(
              this.config.key, info['id'], nbId, node['tree-id'], partType, metadataContent
            );
            return Observable.fromPromise(insertNode);
          } else return Observable.throwError(new Error('cannot insert node'));
        })
        .flatMap(response => {
          if (recordMetadata.workspaces) {
            const wss = recordMetadata.workspaces.find(id => workspace.oid === id);
            if (!wss) {
              recordMetadata.workspaces.push({id: workspace.oid});
            }
          }
          return WorkspaceService.updateRecordMeta(this.config, recordMetadata, rdmp);
        })
        .subscribe(response => {
          this.ajaxOk(req, res, null, {status: true, message: 'workspaceRecordCreated'});
        }, error => {
          sails.log.error('link: error');
          sails.log.error(error);
          this.ajaxFail(req, res, error.message, {status: false, message: error.message});
        });
    }

    checkLink(req, res) {
      const userId = req.user.id;
      const username = req.user.username;
      const rdmp = req.param('rdmp');
      const nbId = req.param('nbId');
      const workspace = req.param('workspace');
      let info = {};
      let check = {
        link: ''
      };
      this.config.brandingAndPortalUrl = BrandingService.getFullPath(req);
      return WorkspaceService.workspaceAppFromUserId(userId, this.config.appName)
        .flatMap(response => {
          info = response.info;
          const nbTree = LabarchivesService.getNotebookTree(this.config.key, info['id'], nbId, 0);
          return Observable.fromPromise(nbTree);
        })
        .subscribe(response => {
          if (response['tree-tools'] && response['tree-tools']['level-nodes']) {
            const lvlNodes = response['tree-tools']['level-nodes'];
            const nodes = lvlNodes['level-node'];
            if (Array.isArray(nodes)) {
              nodes.map(node => {
                if (node['display-text'] === 'stash.workspace') {
                  check.link = 'linked';
                }
              });
            }
          }
          this.ajaxOk(req, res, null, {status: true, check: check, message: 'checkLink'});
        }, error => {
          sails.log.error('checkLink: error');
          sails.log.error(error);
          this.ajaxFail(req, res, error.message, {status: false, message: error.message});
        });
    }
  }
}
module.exports = new Controllers.LabarchivesController().exports();
