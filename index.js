const _ = require('lodash');

const LabArchivesController = require('./api/controllers/LabArchivesController');
const LabArchivesService = require('./api/services/LabArchivesService');
const recordTypeConfig = require('./config/recordtype.js');
const workflowConfig = require('./config/workflow.js');
const recordFormConfig = require('./form-config/template-1.0-draft.js');

module.exports = function (sails) {
  return {
    initialize: function (cb) {
      // Do Some initialisation tasks
      // This can be for example: copy files or images to the redbox-portal front end
      return cb();
    },
    //If each route middleware do not exist sails.lift will fail during hook.load()
    routes: {
      before: {},
      after: {
        'get /:branding/:portal/ws/labarchives/hello': LabArchivesController.helloWorld
      }
    },
    configure: function () {
      sails.services['LabArchivesService'] = LabArchivesService;
      sails.config = _.merge(sails.config, recordTypeConfig);
      sails.config = _.merge(sails.config, workflowConfig);
      sails.config['form']['forms'] = _.merge(sails.config['form']['forms'], {'labarchives-1.0-draft': recordFormConfig});
    }
  }
};
