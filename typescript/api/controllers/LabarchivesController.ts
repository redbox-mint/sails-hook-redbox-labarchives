declare var module;
declare var sails, Model;
declare var _;

import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';

declare var BrandingService, WorkspaceService, LabarchivesService;
/**
 * Package that contains all Controllers.
 */
import controller = require('../core/CoreController');
import {Config} from '../Config';

export module Controllers {

  /**
   * Omero related features....
   *
   */
  export class LabarchivesController extends controller.Controllers.Core.Controller {

    protected _exportedMethods: any = [
      'login',
    ];
    _config: any;

    protected config: Config;

    constructor() {
      super();
      this.config = new Config(sails.config.workspaces);
    }

    login(req, res) {
      const user = {
        username: req.param('username'),
        password: req.param('password')
      };
      if (user.username && user.password) {
        let labUser = {};
        let notebooks = null;
        const userId = req.user.id;
        this.config.brandingAndPortalUrl = BrandingService.getFullPath(req);
        const userInfo = LabarchivesService.login(this.config.key, user.username, user.password);
        return Observable.fromPromise(userInfo)
          .subscribe((response) => {
            if (response['users']) {
              const laResponse = response['users'];
              sails.log.debug(laResponse);
              labUser = {
                fullName: laResponse['fullname'],
                orcid: laResponse['orcid'],
                notebooks: laResponse['notebooks']
              };
            }
            this.ajaxOk(req, res, null, {status: true, labUser: labUser});
          }, (error) => {
            sails.log.error(error);
            this.ajaxFail(req, res, error.message, {status: false, message: error.message});
          });
      }
      else {
        const message = 'Input username and password';
        this.ajaxFail(req, res, message, {status: false, message: message});
      }
    }

  }
}
module.exports = new Controllers.LabarchivesController().exports();
