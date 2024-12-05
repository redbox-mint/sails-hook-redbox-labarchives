module.exports.workspaces = {
  provisionerUser: 'admin',
  parentRecord: 'rdmp',
  labarchives: {
    parentRecord: 'rdmp',
    formName: 'labarchives-1.0-draft',
    workflowStage: 'draft',
    appName: 'labarchives',
    appId: 'labarchives',
    recordType: 'labarchives',
    workspaceFileName: 'README.md',
//  key: {"akid": "USER", "password": "PASSWORD"},
    key: { "baseurl": "https://au-mynotebook.labarchives.com", "api": "/api" },
    location: 'https://au-mynotebook.labarchives.com',
    description: 'eNotebook Workspace'
  }
};