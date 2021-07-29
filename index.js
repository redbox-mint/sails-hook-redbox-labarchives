const _ = require('lodash');
const ncp = require('ncp');
const fs = require('fs-extra');

const LabarchivesController = require('./api/controllers/LabarchivesController');
const LabarchivesService = require('./api/services/LabarchivesService');
const recordTypeConfig = require('./config/recordtype.js');
const workflowConfig = require('./config/workflow.js');
const workspaceTypeConfig = require('./config/workspacetype.js');
const recordFormConfig = require('./form-config/labarchives-1.0-draft.js');

module.exports = function (sails) {
  return {
    initialize: function (cb) {
      // Do Some initialisation tasks
      // This can be for example: copy files or images to the redbox-portal front end
      // To test run with: NODE_ENV=test mocha
      // The Hook is environment specific, that is, the environments are also available whenever the sails app is hooked
      let angularDest;
      let angularOrigin;
      ncp.limit = 16;
      let angularTmpDest = '.tmp/public/angular/labarchives';

      if (sails.config.environment === 'test') {
        angularOrigin = './angular/labarchives/src';
        angularDest = 'test/angular/labarchives';
      }
      else {
        angularOrigin = './node_modules/sails-hook-redbox-labarchives/angular/labarchives/dist';
        angularDest = './assets/angular/labarchives';
      }
      if (fs.existsSync(angularDest)) {
        fs.removeSync(angularDest)
      }
      if (fs.existsSync(angularTmpDest)) {
        fs.removeSync(angularTmpDest)
      }
      ncp(angularOrigin, angularTmpDest, function (err) {
        if (err) {
          return console.error(err);
        } else {
          console.log('LabArchives: Copied angular app to ' + angularTmpDest);
        }
        ncp(angularOrigin, angularDest, function (err) {
          if (err) {
            return console.error(err);
          } else {
            console.log('LabArchives: Copied angular app to ' + angularDest);
          }
          return cb();
        });
      });

    },
    //If each route middleware do not exist sails.lift will fail during hook.load()
    routes: {
      before: {},
      after: {
        'get /:branding/:portal/ws/labarchives/info': LabarchivesController.info,
        'get /:branding/:portal/ws/labarchives/list': LabarchivesController.list,
        'post /:branding/:portal/ws/labarchives/login': LabarchivesController.login,
        'post /:branding/:portal/ws/labarchives/link': LabarchivesController.link,
        'post /:branding/:portal/ws/labarchives/checkLink': LabarchivesController.checkLink,
        'post /:branding/:portal/ws/labarchives/create': LabarchivesController.createNotebook,
        'post /:branding/:portal/ws/labarchives/rdmp': LabarchivesController.rdmpInfo,
        'post /:branding/:portal/ws/labarchives/notebook': LabarchivesController.getNotebook,
        'post /:branding/:portal/ws/labarchives/export': LabarchivesController.exportNotebook,
        'post /:branding/:portal/ws/labarchives/zipExport': LabarchivesController.zipExport,
        'post /:branding/:portal/ws/labarchives/returnExport': LabarchivesController.returnExport,
        'post /:branding/:portal/ws/labarchives/createDataRecord': LabarchivesController.createDataRecord
      }
    },
    configure: function () {
      sails.services['LabarchivesService'] = LabarchivesService;
      sails.config = _.merge(sails.config, recordTypeConfig);
      sails.config = _.merge(sails.config, workflowConfig);
      sails.config = _.merge(sails.config, workspaceTypeConfig);
      sails.config['form']['forms'] = _.merge(sails.config['form']['forms'], {'labarchives-1.0-draft': recordFormConfig});
    }
  }
};
