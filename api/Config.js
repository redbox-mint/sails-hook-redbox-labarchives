"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Config {
    constructor(workspaces) {
        const workspaceConfig = workspaces;
        const la = workspaceConfig.labarchives;
        this.host = la.host;
        this.recordType = la.recordType;
        this.workflowStage = la.workflowStage;
        this.formName = la.formName;
        this.appName = la.appName;
        this.domain = la.domain;
        this.parentRecord = workspaceConfig.parentRecord;
        this.provisionerUser = workspaceConfig.provisionerUser;
        this.authorization = workspaceConfig.portal.authorization;
        this.location = la.location;
        this.description = la.description;
        this.brandingAndPortalUrl = '';
        this.redboxHeaders = {
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
            'Authorization': this.authorization
        };
        this.defaultGroupId = la.defaultGroupId;
        this.types = la.types;
        this.workspaceFileName = la.workspaceFileName;
        this.key = la.key;
    }
}
exports.Config = Config;
