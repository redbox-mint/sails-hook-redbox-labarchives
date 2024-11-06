declare var module;
declare var sails, Model;
declare var _;

import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';

declare var BrandingService, WorkspaceService, RecordsService;
/**
 * Package that contains all Controllers.
 */
import { Controllers as controllers} from '@researchdatabox/redbox-core-types';
import {Config} from '../Config';
import {UserInfo} from "../UserInfo";

export module Controllers {

  /**
   * Omero related features....
   *
   */
  export class LabarchivesController extends controllers.Core.Controller  {

    protected _exportedMethods: any = [
      'info',
      'rdmpInfo',
      'login',
      'link',
      'checkLink',
      'list',
      'createNotebook'
    ];
    

    protected config: any = new Config();
    protected logHeader: string = "LabArchivesController::";

    public info(req, res) {
      this.config.set();
      this.config.brandingAndPortalUrl = BrandingService.getFullPath(req);
      this.ajaxOk(req, res, null, {location: this.config.location, status: true});
    }

    async rdmpInfo(req, res) {
      this.config.set();
      const userId = req.user.id;
      const rdmp = req.param('rdmp');
      let recordMetadata = {};
      this.config.brandingAndPortalUrl = BrandingService.getFullPath(req);
      let infoResp = {status: false, message: "Error retrieving associated RDMP, please contact an administrator."};
      try {
        recordMetadata = await RecordsService.getMeta(rdmp);
        if (recordMetadata) {
          infoResp.status = true;
          infoResp['recordMetadata'] = recordMetadata['metadata'];
        } 
      } catch (err) {
        sails.log.error(`${this.logHeader} rdmpInfo() -> Failed to get metadata:`);
        sails.log.error(err);
      }
      if (infoResp.status === false) {
        this.ajaxFail(req, res, infoResp.message, infoResp);
      } else {
        this.ajaxOk(req, res, null, infoResp);
      }
    }

    async login(req, res) {
      this.config.set();
      const user = {
        username: req.param('username'),
        password: req.param('password')
      };
      const loginResp = {status: false, message: 'Username and/or password invalid'};
      if (user.username && user.password) {
        let info = {};
        const userId = req.user.id;
        this.config.brandingAndPortalUrl = BrandingService.getFullPath(req);
        try {
          let userInfo = await sails.services.labarchivesservice.login(this.config.key, user.username, user.password);
          if (userInfo && userInfo['users']) {
            userInfo = userInfo['users'];
            info = new UserInfo(userInfo['id'], userInfo['orcid'], userInfo['fullname']);
            const workspaceInfo = await WorkspaceService.workspaceAppFromUserId(userId, this.config.appName).toPromise();
            if (workspaceInfo && workspaceInfo['id']) {
              await WorkspaceService.updateWorkspaceInfo(workspaceInfo['id'], info).toPromise();
            } else {
              await WorkspaceService.createWorkspaceInfo(userId, this.config.appName, info).toPromise();
            }
            loginResp.status = true;
            loginResp['login'] = true;
          } 
        } catch (err) {
          sails.log.error(`${this.logHeader} login() -> Error: `);
          sails.log.error(err);
          loginResp.message = `Error logging in, please contact an administrator.`;
        }
      } else {
        loginResp.message = 'Missing username and/or password';
      }

      if (loginResp.status === true) {
        this.ajaxOk(req, res, null, loginResp);
      } else {
        this.ajaxFail(req, res, loginResp.message, loginResp);
      }
    }

    async list(req, res) {
      this.config.set();
      const userId = req.user.id;
      this.config.brandingAndPortalUrl = BrandingService.getFullPath(req);
      let listResp = {status: false, message: `Failed to retrieve list, please contact and administrator.`};
      try {
        const workspaceApp = await WorkspaceService.workspaceAppFromUserId(userId, this.config.appName).toPromise();
        let user = null;
        if (!workspaceApp) {
          user = null;
        } else {
          user = workspaceApp['info'] || null;
        }
        if (user) {
          const userInfo = await sails.services.labarchivesservice.userInfo(this.config.key, user['id'], true);
          if (userInfo) {
            let resNotebooks = userInfo['users']['notebooks'];
            let notebooks = {'$': { type: 'array' }, notebook: []};
            if(Array.isArray(resNotebooks['notebook'])) {
              notebooks['notebook'] = resNotebooks['notebook'];
            } else {
              if(resNotebooks['notebook']){
                notebooks['notebook'] = [resNotebooks['notebook']];
              }
            }
            listResp.status = true;
            listResp['notebooks'] = notebooks;
            listResp.message = 'list';
          } else {
            listResp.message = `Failed to get user information, please contact an administrator.`;  
            sails.log.error(`${this.logHeader} list() ->  failed to retrieve user info`);
          }
        } else {
          listResp.message = `Failed to get workspace information, please contact an administrator.`;
          sails.log.error(`${this.logHeader} list() -> Failed to get workspace app info`);
        }
      } catch (err) {
        sails.log.error(`${this.logHeader} list() -> Failed to list:`);
        sails.log.error(err);
      }
      // send response
      if (listResp.status === true) {
        this.ajaxOk(req, res, listResp.message, listResp);
      } else {
        this.ajaxFail(req, res, listResp.message, listResp);
      }
    }

    async link(req, res) {
      this.config.set();
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
      let workspaceId: any = null;
      let metadataContent = '';
      let rdmpTitle = '';
      let recordMetadata = null;
      const linkResp = {status: false, message: `Failed to link, please contact an administrator.`};
      try {
        recordMetadata = (await RecordsService.getMeta(rdmp))?.metadata;
        if (recordMetadata) {
          rdmpTitle = recordMetadata.title;
          info = (await WorkspaceService.workspaceAppFromUserId(userId, this.config.appName).toPromise())?.info;
          if (info) {
            const record = {
              rdmpOid: rdmp,
              rdmpTitle: rdmpTitle,
              title: nbName,
              location: this.config.location, //`https://au-mynotebook.labarchives.com`,
              description: this.config.description, //'LabArchives Workspace',
              type: this.config.recordType
            };
            const createResp = await WorkspaceService.createWorkspaceRecord(
              this.config, username, record, this.config.recordType, this.config.workflowStage
            ).toPromise();
            if (createResp) {
              workspaceId = createResp.data.workspaceOid;
              const insertNodeResp = await sails.services.labarchivesservice.insertNode(this.config.key, info['id'], nbId, 'stash.workspace', false);
              if (insertNodeResp && insertNodeResp['tree-tools']) {
                const tree = insertNodeResp['tree-tools'];
                const node = tree['node'];
                metadataContent = `
              <div id="${workspaceId}">
                <h1>UTS</h1>
                <h3>Workspace <strong>${nbName}</strong> is linked to:</h3>
                <h2>Research Data Management Plan <a href="${this.config.brandingAndPortalUrl}/record/view/${rdmp}">${rdmpTitle}</a></h2>
                <p>Stash Id: ${workspaceId}</p>
              </div>
              `;
                const partType = 'text entry';
                const insertNode = await sails.services.labarchivesservice.addEntry(
                  this.config.key, info['id'], nbId, node['tree-id'], partType, metadataContent
                );
                if (insertNode) {
                  linkResp.status = true;
                  linkResp.message = 'workspaceRecordCreated';
                } else {
                  sails.log.error(`${this.logHeader} link() -> Failed in sails.services.labarchivesservice.addEntry`);
                }
              } else {
                sails.log.error(`${this.logHeader} link() -> LabArchives insertNode failed:`);
                sails.log.error(insertNodeResp);
              }
            } else {
              sails.log.error(`${this.logHeader} link() -> Failed to create workspace record.`);
            }
          } else {
            sails.log.error(`${this.logHeader} link() -> Failed to get workspace app info.`);
          }
        } else {
          linkResp.message = `Failed to get RDMP, please contact an administrator.`;
        }
      } catch (err) {
        sails.log.error(`${this.logHeader} link() -> Failed to link:`);
        sails.log.error(err);
      }
      // send response
      if (linkResp.status === true) {
        this.ajaxOk(req, res, null, linkResp);
      } else {
        this.ajaxFail(req, res, linkResp.message, linkResp);
      }
    }

    async checkLink(req, res) {
      this.config.set();
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
      const checkLinkResp = {status: false, message: `Failed to check link, please contact an administrator.`};
      try {
        info = await WorkspaceService.workspaceAppFromUserId(userId, this.config.appName).toPromise();
        if (info) {
          info = info['info'];
          const nbTree = await sails.services.labarchivesservice.getNotebookTree(this.config.key, info['id'], nbId, 0);
          if (nbTree['tree-tools'] && nbTree['tree-tools']['level-nodes']) {
            const lvlNodes = nbTree['tree-tools']['level-nodes'];
            const nodes = lvlNodes['level-node'];
            if (Array.isArray(nodes)) {
              nodes.map(node => {
                if (node['display-text'] === 'stash.workspace') {
                  check.link = 'linked';
                }
              });
            }
          }
          checkLinkResp['check'] = check;
          checkLinkResp.message = 'checkLink';
          checkLinkResp.status = true;
        } else {
          sails.log.error(`${this.logHeader} checkLink() -> Failed to get workspace app info`);
        }
      } catch (err) {
        sails.log.error(`${this.logHeader} checkLink() -> Failed to check link:`);
        sails.log.error(err);
      }
      // sending response
      if (checkLinkResp.status === true) {
        this.ajaxOk(req, res, null, checkLinkResp);
      } else {
        this.ajaxFail(req, res, checkLinkResp.message, checkLinkResp);
      }
    }

    public async createNotebook(req, res): Promise<any> {
      this.config.set();
      const userId = req.user.id;
      const name = req.param('name');
      const userEmail = req.param('userEmail');
      let supervisor = req.param('supervisor');
      const rdmp = req.param('rdmp');
      let recordMetadata = {};
      let rdmpTitle = '';
      let info = {};
      let nb;
      this.config.brandingAndPortalUrl = BrandingService.getFullPath(req);
      let createResponse = await RecordsService.getMeta(rdmp);
      const contactAdmin = `please contact an administrator`;
      try {
        if (!_.isEmpty(createResponse)) {
          recordMetadata = createResponse.metadata;
          sails.log.debug(`${this.logHeader} createNotebook() -> recordMetadata:`);
          sails.log.debug(recordMetadata);
          rdmpTitle = recordMetadata['title'];
          const supervisorFromRDMP = recordMetadata['contributor_ci']['email'];
          if (supervisor === supervisorFromRDMP) {
            const info = (await WorkspaceService.workspaceAppFromUserId(userId, this.config.appName).toPromise())?.info;
            sails.log.debug('userHasEmail');
            const supervisorHasEmail = await sails.services.labarchivesservice.userHasEmail(this.config.key, supervisor);
            if (supervisorHasEmail && supervisorHasEmail['users'] && supervisorHasEmail['users']['account-for-email']['_']) {
              sails.log.debug(`${this.logHeader} createNotebook() -> Has supervisor email, creating notebook: ${name}`);
              const result = await sails.services.labarchivesservice.createNotebook(this.config.key, info['id'], name);
              sails.log.verbose(`${this.logHeader} createNotebook: `);
              sails.log.verbose(result);
              if (result && result.notebooks) {
                nb = result.notebooks;
                if (userEmail.toLowerCase() === supervisor.toLowerCase()) {
                  createResponse = {status: true, response: nb};
                } else {
                  const addUser = await sails.services.labarchivesservice.addUserToNotebook(this.config.key, info['id'], nb['nbid'], supervisor, 'ADMINISTRATOR');
                  sails.log.debug('addUser');
                  if (addUser) {
                    const nbu = addUser.notebooks['notebook-user'];
                    sails.log.debug(nbu);
                    createResponse = {status: true, response: nb};
                  } else {
                    sails.log.error(`${this.logHeader} createNotebook() -> Cannot add user to notebook`);    
                    createResponse = {status: false, message: 'Cannot add user to notebook, please contact an administrator.'};
                  }
                }
              } else {
                sails.log.error(`${this.logHeader} createNotebook() -> Notebook not created:`);
                createResponse = {status: false, message: 'Failed to create notebook, please contact an administrator.'};
              }
            } else {
              const message = `Supervisor not found in LabArchives: ${supervisor}`;
              sails.log.error(`${this.logHeader} createNotebook() -> ${message}`);
              createResponse = {status: false, message: `${message}, ${contactAdmin}` };
            }
          } else {
            const message = `Supervisor email does not match workspace: ${supervisor} === ${supervisorFromRDMP}`;
            sails.log.error(`${this.logHeader} createNotebook() -> ${message}`);  
            createResponse = {status: false, message: `${message}, ${contactAdmin}`};
          }
        } else {
          const message = `RDMP Not found: ${rdmp}`;
          sails.log.error(`${this.logHeader} createNotebook() -> ${message}`);
          createResponse = {status: false, message: `${message}, ${contactAdmin}`};
        }
      } catch (err) {
        sails.log.error(`${this.logHeader} createNotebook() -> Error thrown while processing: `);
        sails.log.error(err);
        createResponse = {status: false, message: err.message};
      } 
      // handle failure
      try {
        if (createResponse.status === true) {
          sails.log.verbose(`${this.logHeader} createNotebook() -> Sending success response`)
          sails.log.debug(JSON.stringify(createResponse));
          this.ajaxOk(req, res, null, {status: true, nb: nb['nbid'], name: name, message: 'createNotebook'});
        } else {
          sails.log.error(`${this.logHeader} createNotebook() -> Sending failure response`);
          this.ajaxFail(req, res, createResponse.message, createResponse); 
        }
      } catch (err) {
        sails.log.error(`${this.logHeader} createNotebook() -> Error thrown while sending response: `);
        sails.log.error(err);
      }
    }
  }
}
module.exports = new Controllers.LabarchivesController().exports();
