"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Rx_1 = require("rxjs/Rx");
require("rxjs/add/operator/map");
const controller = require("../core/CoreController");
const Config_1 = require("../Config");
var Controllers;
(function (Controllers) {
    class LabarchivesController extends controller.Controllers.Core.Controller {
        constructor() {
            super();
            this._exportedMethods = [
                'login',
            ];
            this.config = new Config_1.Config(sails.config.workspaces);
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
                return Rx_1.Observable.fromPromise(userInfo)
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
                    this.ajaxOk(req, res, null, { status: true, labUser: labUser });
                }, (error) => {
                    sails.log.error(error);
                    this.ajaxFail(req, res, error.message, { status: false, message: error.message });
                });
            }
            else {
                const message = 'Input username and password';
                this.ajaxFail(req, res, message, { status: false, message: message });
            }
        }
    }
    Controllers.LabarchivesController = LabarchivesController;
})(Controllers = exports.Controllers || (exports.Controllers = {}));
module.exports = new Controllers.LabarchivesController().exports();
