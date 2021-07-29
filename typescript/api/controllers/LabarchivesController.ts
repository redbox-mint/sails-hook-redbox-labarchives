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
import {ExportConfig} from '../ExportConfig';
import {UserInfo} from "../UserInfo";

export module Controllers {

  /**
   * Omero related features....
   *
   */
  export class LabarchivesController extends controller.Controllers.Core.Controller {

    protected _exportedMethods: any = [
      'info',
      'rdmpInfo',
      'login',
      'link',
      'checkLink',
      'list',
      'createNotebook',
      'getNotebook',
      'getNotebookInfo',
      'exportNotebook',
      'zipExport',
      'returnExport',
      'createDataRecord'
    ];
    _config: any;

    protected config: Config;
    protected exportConfig: ExportConfig;

    constructor() {
      super();
      this.config = new Config(sails.config.workspaces);
      const eC = sails.config.workspaces.labarchives.exportConfig;
      this.exportConfig = new ExportConfig(eC.host, eC.authorization, eC.exportNotebook, eC.zipNotebook, eC.returnNotebook, eC.exportDir);
    }

    public info(req, res) {
      this.config.brandingAndPortalUrl = BrandingService.getFullPath(req);
      this.ajaxOk(req, res, null, {location: this.config.location, status: true});
    }

    public rdmpInfo(req, res) {
      sails.log.debug('rdmpInfo');
      const userId = req.user.id;
      const rdmp = req.param('rdmp');
      let recordMetadata = {};
      this.config.brandingAndPortalUrl = BrandingService.getFullPath(req);
      return WorkspaceService.getRecordMeta(this.config, rdmp)
        .subscribe(response => {
          sails.log.debug('recordMetadata');
          recordMetadata = response;
          this.ajaxOk(req, res, null, {status: true, recordMetadata: recordMetadata});
        }, error => {
          sails.log.error('recordMetadata: error');
          sails.log.error(error);
          this.ajaxFail(req, res, error.message, {status: false, message: error.message});
        });
    }

    public login(req, res) {
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
      } else {
        const message = 'Input username and password';
        this.ajaxFail(req, res, message, {status: false, message: message});
      }
    }

    public list(req, res) {
      sails.log.debug('list');
      const userId = req.user.id;
      this.config.brandingAndPortalUrl = BrandingService.getFullPath(req);
      let info = {};
      return WorkspaceService.workspaceAppFromUserId(userId, this.config.appName)
        .flatMap(response => {
          let user = null;
          if (!response) {
            user = null;
          } else {
            user = response['info'] || null;
          }
          if (user) {
            const userInfo = LabarchivesService.userInfo(this.config.key, user['id'], true);
            return Observable.fromPromise(userInfo);
          } else {
            return Observable.throwError('cannot get user info');
          }
        })
        .subscribe(response => {
          let resNotebooks = response['users']['notebooks'];
          let notebooks = {'$': {type: 'array'}, notebook: []};
          if (Array.isArray(resNotebooks['notebook'])) {
            notebooks['notebook'] = resNotebooks['notebook'];
          } else {
            if (resNotebooks['notebook']) {
              notebooks['notebook'] = [resNotebooks['notebook']];
            }
          }
          this.ajaxOk(req, res, null, {status: true, notebooks: notebooks, message: 'list'});
        }, error => {
          sails.log.error('list: error');
          sails.log.error(error);
          this.ajaxFail(req, res, error.message, {status: false, message: error.message});
        });
    }

    public link(req, res) {
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
            locationId: nbId,
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

    public checkLink(req, res) {
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

    public getNotebook(req, res) {
      const userId = req.user.id;
      const notebook = req.param('notebook');
      sails.log.debug('getting notebook: ' + notebook);
      if (!notebook) {
        const message = 'notebook missing';
        this.ajaxFail(req, res, message, {status: false, message: message});
        return;
      }
      const nbId = notebook;
      let info = {};
      this.config.brandingAndPortalUrl = BrandingService.getFullPath(req);
      return WorkspaceService.workspaceAppFromUserId(userId, this.config.appName)
        .subscribe(async response => {
          sails.log.debug(response);
          info = response.info;
          const nbInfo = await LabarchivesService.getNotebookInfo(this.config.key, info['id'], nbId);
          sails.log.debug(nbInfo);
          this.ajaxOk(req, res, null, {status: true, nb: nbInfo, message: 'getNotebook'});
        }, error => {
          sails.log.error('getNotebook: error');
          sails.log.error(error);
          this.ajaxFail(req, res, error.message, {status: false, message: error.message});
        });
    }

    public createNotebook(req, res) {
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
      return WorkspaceService.getRecordMeta(this.config, rdmp)
        .flatMap(response => {
          sails.log.debug('recordMetadata');
          recordMetadata = response;
          rdmpTitle = recordMetadata['title'];
          const supervisorFromRDMP = recordMetadata['contributor_ci']['email'];
          if (supervisor === supervisorFromRDMP) {
            return WorkspaceService.workspaceAppFromUserId(userId, this.config.appName);
          } else {
            Observable.throwError(new Error('Supervisor email does not match workspace'));
          }
          sails.log.debug(recordMetadata);
        })
        .flatMap(async response => {
          sails.log.debug('workspaceAppFromUserId');
          info = response.info;
          sails.log.debug('userHasEmail');
          const supervisorHasEmail = await LabarchivesService.userHasEmail(this.config.key, supervisor);
          if (supervisorHasEmail && supervisorHasEmail['users'] && supervisorHasEmail['users']['account-for-email']['_']) {
            sails.log.debug('createNotebook');
            const result = await LabarchivesService.createNotebook(this.config.key, info['id'], name);
            if (result && result.notebooks) {
              nb = result.notebooks;
              if (userEmail.toLowerCase() === supervisor.toLowerCase()) {
                return Observable.of(nb);
              } else {
                const addUser = await LabarchivesService.addUserToNotebook(this.config.key, info['id'], nb['nbid'], supervisor, 'ADMINISTRATOR');
                sails.log.debug('addUser');
                if (addUser) {
                  const nbu = addUser.notebooks['notebook-user'];
                  sails.log.debug(nbu);
                  return Observable.of(nb);
                } else {
                  Observable.throwError(new Error('Cannot add user to notebook'));
                }
              }
            } else {
              Observable.throwError(new Error('Notebook not created'));
            }
          } else {
            Observable.throwError(new Error('Supervisor not on LabArchives'));
          }
        })
        .subscribe(response => {
          sails.log.debug('create notebook');
          this.ajaxOk(req, res, null, {status: true, nb: nb['nbid'], name: name, message: 'createNotebook'});
        }, error => {
          sails.log.error('createNotebook: error');
          sails.log.error(error);
          this.ajaxFail(req, res, error.message, {status: false, message: error.message});
        });
    }

    public getNotebookInfo(req, res) {
      const userId = req.user.id;
      const username = req.user.username;
      this.config.brandingAndPortalUrl = BrandingService.getFullPath(req);
      const rdmp = req.param('rdmp');
      const workspace = req.param('workspace');
      if (!workspace) {
        const message = 'no workspace provided';
        this.ajaxFail(req, res, message, {status: false, message: message});
      } else {
        sails.log.debug('get notebook: ' + workspace);
        return WorkspaceService.getRecordMeta(this.config, workspace)
          .subscribe(response => {
            sails.log.debug(response);
            if (!response.title) {
              const message = 'workspace not found';
              this.ajaxFail(req, res, message, {status: false, message: message});
            } else {
              const nb = response;
              this.ajaxOk(req, res, null, {status: true, nb: nb, message: 'workspaceInfo'});
            }
          }, error => {
            sails.log.error('getNotebookInfo: error');
            sails.log.error(error);
            this.ajaxFail(req, res, error.message, {status: false, message: error.message});
          });
      }
    }

    public async exportNotebook(req, res): Promise<any> {
      try {
        const userId = req.user.id;
        const username = req.user.username;
        this.config.brandingAndPortalUrl = BrandingService.getFullPath(req);
        const rdmp = req.param('rdmp');
        const notebook = req.param('notebook');
        sails.log.debug('exportNotebook notebook');
        WorkspaceService.workspaceAppFromUserId(userId, this.config.appName)
          .subscribe(async workspaceAppInfo => {
            const workspaceInfo = workspaceAppInfo['info'];
            const exportNotebook = await LabarchivesService.exportNotebook(this.exportConfig, workspaceInfo['id'], notebook);
            let exportedId;
            if (!exportNotebook.error) {
              exportedId = exportNotebook.notebookId;
              this.ajaxOk(req, res, null, {status: true, nb: exportedId, message: 'exportNotebook'});
            } else {
              this.ajaxFail(req, res, exportNotebook.error, {status: false, message: exportNotebook.error});
            }
          }, error => {
            sails.log.error(error);
            const message = 'error starting export';
            this.ajaxFail(req, res, message, {status: false, message: message});
          });
      } catch (error) {
        sails.log.error('exportNotebook: error');
        sails.log.error(error);
        this.ajaxFail(req, res, error.message, {status: false, message: error.message});
      }
    }

    public async zipExport(req, res): Promise<any> {
      try {
        const userId = req.user.id;
        const username = req.user.username;
        this.config.brandingAndPortalUrl = BrandingService.getFullPath(req);
        const rdmp = req.param('rdmp');
        const notebook = req.param('notebook');
        sails.log.debug('zipExport notebook');
        WorkspaceService.workspaceAppFromUserId(userId, this.config.appName)
          .subscribe(async workspaceAppInfo => {
            const workspaceInfo = workspaceAppInfo['info'];
            const exportNotebook = await LabarchivesService.zipExport(this.exportConfig, notebook);
            let exportedId;
            if (!exportNotebook.error) {
              exportedId = exportNotebook.notebookId;
              this.ajaxOk(req, res, null, {status: true, nb: exportedId, message: 'exportNotebook'});
            } else {
              this.ajaxFail(req, res, exportNotebook.error, {status: false, message: exportNotebook.error});
            }
          }, error => {
            sails.log.error(error);
            const message = 'error starting export';
            this.ajaxFail(req, res, message, {status: false, message: message});
          });
      } catch (error) {
        sails.log.error('zipExport: error');
        sails.log.error(error);
        this.ajaxFail(req, res, error.message, {status: false, message: error.message});
      }
    }

    public async returnExport(req, res): Promise<any> {
      try {
        const userId = req.user.id;
        const username = req.user.username;
        this.config.brandingAndPortalUrl = BrandingService.getFullPath(req);
        const rdmp = req.param('rdmp');
        const notebook = req.param('notebook');
        sails.log.debug('returnExport notebook');
        WorkspaceService.workspaceAppFromUserId(userId, this.config.appName)
          .subscribe(async workspaceAppInfo => {
            const workspaceInfo = workspaceAppInfo['info'];
            const exportNotebook = await LabarchivesService.returnExport(this.exportConfig, notebook);
            if (!exportNotebook.error) {
              sails.log.debug(exportNotebook);
              this.ajaxOk(req, res, null, {status: true, nb: notebook, message: 'exportNotebook'});
            } else {
              this.ajaxFail(req, res, exportNotebook.error, {status: false, message: exportNotebook.error});
            }
          }, error => {
            sails.log.error(error);
            const message = 'error starting export';
            this.ajaxFail(req, res, message, {status: false, message: message});
          });
      } catch (error) {
        sails.log.error('createNotebook: error');
        sails.log.error(error);
        this.ajaxFail(req, res, error.message, {status: false, message: error.message});
      }
    }

    public createDataRecord(req, res) {
      const userId = req.user.id;
      const username = req.user.username;
      this.config.brandingAndPortalUrl = BrandingService.getFullPath(req);
      const brandId = BrandingService.brandId;
      const rdmp = req.param('rdmp');
      const rdmpTitle = req.param('rdmpTitle');
      const notebook_title = req.param('notebookTitle');
      const notebook_file = req.param('notebookFile');
      const isHdr = req.param('isHdr');
      const retention = req.param('retention');
      const disposal = req.param('disposal');
      const isc = req.param('isc');
      const contributor_ci = req.param('contributor_ci');
      const contributor_data_manager = req.param('contributor_data_manager');
      const keywords = req.param('keywords');

      sails.log.debug('create Data Record notebook');
      // First get rdmp metadata. We need the authorization user list from the data manager and the ci
      // /default/rdmp/api/records/metadata/{oid}
      // create authorization view/edit for this users or all users that are in view/edit
      // get keywords
      // get fnci/dm objects and store in metadata
      // write the title as the name of the notebook
      // write a sample description
      let recordId = '';
      let recordMetadata = {};
      return WorkspaceService.getRecordMeta(this.config, rdmp)
        .subscribe(async response => {
          sails.log.debug('recordMetadata');
          recordMetadata = response;
          const metadata = {
            rdmp: {
              oid: rdmp,
              title: rdmpTitle
            },
            contributors_ci: recordMetadata['contributors_ci'],
            contributors_data_manager: recordMetadata['contributors_data_manager'],
            title: notebook_title,
            aim_project_name: rdmpTitle,
            project_hdr: isHdr,
            description: 'Data Record automatically created, please edit this field',
            'redbox:retentionPeriod_dc:date': retention,
            disposalDate: disposal,
            finalKeywords: keywords,
            contributor_ci: contributor_ci,
            contributor_data_manager: contributor_data_manager
          }
          sails.log.debug('create createDataRecord');
          const metaMetadata = {
            brandId: brandId,
            createdBy: username,
            type: "dataRecord",
            form: "dataRecord-1.0-draft",
            attachmentFields: [
              "dataLocations"
            ],
            lastSavedBy: username
          };
          const createDataRecord = await LabarchivesService.createDataRecord(this.config, username, metadata);
          sails.log.debug('create Data Record');
          if (createDataRecord.oid) {
            recordId = createDataRecord.oid;
            const updateMeta = await LabarchivesService.updateMeta(this.config, recordId, metaMetadata);
            if (updateMeta) {
              sails.log.debug(updateMeta);
              sails.log.debug('Uploading File');
              const dataRecord = await LabarchivesService.saveDataStream(this.config, this.exportConfig, recordId, notebook_file, {isc: isc});
              sails.log.debug(dataRecord);
              if (dataRecord.success) {
                const putDataStream = await LabarchivesService.listDataStream(this.config, recordId);
                sails.log.debug(putDataStream['success']);
                sails.log.debug(putDataStream['records']);
                const dataLocations = putDataStream['records'];
                _.each(dataLocations, (dL) => {
                  const location = `${dL['redboxOid']}/attach/${dL['fileId']}`;
                  dL['type'] = 'attachment';
                  dL['location'] = location;
                  dL['uploadUrl'] = `${this.config.brandingAndPortalUrl}/record/${location}`;
                  dL['isc'] = isc;
                })
                if (putDataStream.success) {
                  metadata['dataLocations'] = dataLocations;
                  const updateDataStream = await LabarchivesService.updateDataRecord(this.config, recordId, metadata)
                  if (updateDataStream.success) {
                    this.ajaxOk(req, res, null, {status: true, recordId: recordId, message: 'created data record'});
                  } else {
                    const message = 'failed to update record with datastream';
                    this.ajaxFail(req, res, message, {status: false, message: message});
                  }
                } else {
                  const message = 'failed to update record with datastream';
                  this.ajaxFail(req, res, message, {status: false, message: message});
                }
              } else {
                const message = 'failed to upload record';
                this.ajaxFail(req, res, message, {status: false, message: message});
              }
            } else {
              const message = 'failed to create a data record';
              this.ajaxFail(req, res, message, {status: false, message: message});
            }
          }
        }, error => {
          sails.log.error(error);
          const message = 'error starting export';
          this.ajaxFail(req, res, message, {status: false, message: message});
        });
    }
  }
}

module.exports = new Controllers.LabarchivesController().exports();
