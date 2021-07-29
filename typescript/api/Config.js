"use strict";
exports.__esModule = true;
var Config = /** @class */ (function () {
    function Config(workspaces) {
        var workspaceConfig = workspaces;
        var la = workspaceConfig.labarchives;
        this.host = la.host;
        this.recordType = la.recordType;
        this.workflowStage = la.workflowStage;
        this.formName = la.formName;
        this.appName = la.appName;
        this.domain = la.domain;
        this.parentRecord = workspaceConfig.parentRecord;
        this.provisionerUser = workspaceConfig.provisionerUser;
        this.location = la.location;
        this.description = la.description;
        this.brandingAndPortalUrl = '';
        this.redboxHeaders = {
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
            'Authorization': workspaceConfig.portal.authorization
        };
        this.defaultGroupId = la.defaultGroupId;
        this.types = la.types;
        this.workspaceFileName = la.workspaceFileName;
        this.key = la.key;
    }
    return Config;
}());
exports.Config = Config;
