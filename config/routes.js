module.exports.routes = {
  'get /:branding/:portal/ws/labarchives/info': 'LabarchivesController.info',
  'get /:branding/:portal/ws/labarchives/list': 'LabarchivesController.list',
  'post /:branding/:portal/ws/labarchives/login': 'LabarchivesController.login',
  'post /:branding/:portal/ws/labarchives/link': 'LabarchivesController.link',
  'post /:branding/:portal/ws/labarchives/checkLink': 'LabarchivesController.checkLink',
  'post /:branding/:portal/ws/labarchives/create': 'LabarchivesController.createNotebook',
  'post /:branding/:portal/ws/labarchives/rdmp': 'LabarchivesController.rdmpInfo'
};