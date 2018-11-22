const LabArchivesService = require('../services/LabArchivesService');

module.exports = {

  helloWorld: function (req, res, next) {
    const hello = LabArchivesService.helloWorld();
    return res.send(hello);
  }
};
