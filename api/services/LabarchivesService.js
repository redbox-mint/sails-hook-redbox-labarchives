"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const la = require("@uts-eresearch/provision-labarchives");
const Config_1 = require("../Config");
const services = require("../core/CoreService");
const axios_1 = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require('form-data');
var Services;
(function (Services) {
    class LabarchivesService extends services.Services.Core.Service {
        constructor() {
            super();
            this._exportedMethods = [
                'login',
                'userInfo',
                'insertNode',
                'addEntry',
                'getNotebookInfo',
                'getNotebookTree',
                'createNotebook',
                'addUserToNotebook',
                'userHasEmail',
                'exportNotebook',
                'zipExport',
                'returnExport',
                'createDataRecord',
                'updateMeta',
                'saveDataStream',
                'listDataStream',
                'updateDataRecord'
            ];
            this.config = new Config_1.Config(sails.config.workspaces);
        }
        login(key, username, password) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    if (key && key['akid'] && key['password']) {
                        return yield la.accessInfo(key, username, password);
                    }
                    else {
                        return Promise.reject(new Error('missing keys for accessing lab archives APIs'));
                    }
                }
                catch (e) {
                    return Promise.reject(new Error(e));
                }
            });
        }
        userInfo(key, userId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    if (key && key['akid'] && key['password']) {
                        return yield la.userInfoViaId(key, userId);
                    }
                    else {
                        return Promise.reject(new Error('missing keys for accessing lab archives APIs'));
                    }
                }
                catch (e) {
                    return Promise.reject(new Error(e));
                }
            });
        }
        insertNode(key, userId, nbId, displayText) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    if (key && key['akid'] && key['password']) {
                        return yield la.insertNode(key, userId, nbId, 0, displayText, false);
                    }
                    else {
                        return Promise.reject(new Error('missing keys for accessing lab archives APIs'));
                    }
                }
                catch (e) {
                    return Promise.reject(new Error(e));
                }
            });
        }
        addEntry(key, userId, nbId, treeId, partType, metadata) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    if (key && key['akid'] && key['password']) {
                        return yield la.addEntry(key, userId, nbId, treeId, partType, metadata);
                    }
                    else {
                        return Promise.reject(new Error('missing keys for accessing lab archives APIs'));
                    }
                }
                catch (e) {
                    return Promise.reject(new Error(e));
                }
            });
        }
        getNotebookInfo(key, userId, nbId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    if (key && key['akid'] && key['password']) {
                        return yield la.getNotebookInfo(key, userId, nbId);
                    }
                    else {
                        return Promise.reject(new Error('missing keys for accessing lab archives APIs'));
                    }
                }
                catch (e) {
                    return Promise.reject(new Error(e));
                }
            });
        }
        getNotebookTree(key, userId, nbId, treeLevel = 0) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    if (key && key['akid'] && key['password']) {
                        return yield la.getTree(key, userId, nbId, treeLevel);
                    }
                    else {
                        return Promise.reject(new Error('missing keys for accessing lab archives APIs'));
                    }
                }
                catch (e) {
                    return Promise.reject(new Error(e));
                }
            });
        }
        createNotebook(key, userId, name) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    if (key && key['akid'] && key['password']) {
                        return yield la.createNotebook(key, userId, name);
                    }
                    else {
                        return Promise.reject(new Error('missing keys for accessing lab archives APIs'));
                    }
                }
                catch (e) {
                    return Promise.reject(new Error(e));
                }
            });
        }
        addUserToNotebook(key, uid, nbid, email, userRole) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    if (key && key['akid'] && key['password']) {
                        return yield la.addUserToNotebook(key, uid, nbid, email, userRole);
                    }
                    else {
                        return Promise.reject(new Error('missing keys for accessing lab archives APIs'));
                    }
                }
                catch (e) {
                    return Promise.reject(new Error(e));
                }
            });
        }
        userHasEmail(key, email) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    if (key && key['akid'] && key['password']) {
                        return yield la.emailHasAccount(key, email);
                    }
                    else {
                        return Promise.reject(new Error('missing keys for accessing lab archives APIs'));
                    }
                }
                catch (e) {
                    return Promise.reject(new Error(e));
                }
            });
        }
        exportNotebook(exportConfig, uid, nbid) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const url = exportConfig.host + '/' + exportConfig.exportNotebook;
                    sails.log.debug(uid);
                    sails.log.debug(nbid);
                    const response = yield axios_1.default.post(url, {
                        uid: uid, nbid: nbid
                    }, { headers: exportConfig.headers });
                    sails.log.debug(response);
                    if (response['data']) {
                        return response['data'];
                    }
                    else {
                        return { error: true, errorMessage: response['error'] };
                    }
                }
                catch (e) {
                    sails.log.debug(exportConfig.headers);
                    return Promise.reject(new Error(e));
                }
            });
        }
        zipExport(exportConfig, nbid) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const url = exportConfig.host + '/' + exportConfig.zipNotebook;
                    sails.log.debug(url);
                    sails.log.debug(nbid);
                    const response = yield axios_1.default.post(url, {
                        notebookId: nbid
                    }, { headers: exportConfig.headers });
                    if (response['data']) {
                        return response['data'];
                    }
                    else {
                        return { error: true, errorMessage: response['error'] };
                    }
                }
                catch (e) {
                    return Promise.reject(new Error(e));
                }
            });
        }
        returnExport(exportConfig, nbid) {
            return __awaiter(this, void 0, void 0, function* () {
                const url = exportConfig.host + '/' + exportConfig.returnNotebook;
                const outPath = path.join(exportConfig.exportDir, `${nbid}.zip`);
                const writer = fs.createWriteStream(outPath);
                return axios_1.default.post(url, {
                    notebookId: nbid
                }, { responseType: 'stream', headers: exportConfig.headers })
                    .then(response => {
                    return new Promise((resolve, reject) => {
                        response.data.pipe(writer);
                        let error = null;
                        writer.on('error', err => {
                            error = err;
                            writer.close();
                            reject(err);
                        });
                        writer.on('close', () => {
                            if (!error) {
                                resolve(true);
                            }
                        });
                    });
                });
            });
        }
        createDataRecord(config, username, metadata) {
            return __awaiter(this, void 0, void 0, function* () {
                const createUrl = config.brandingAndPortalUrl + `/api/records/metadata/dataRecord`;
                const data = {
                    "metadata": metadata,
                    "workflowStage": "draft",
                    "authorization": {
                        "edit": [
                            username
                        ],
                        "view": [
                            username
                        ],
                        "editRoles": [
                            "Admin", "Librarians"
                        ],
                        "viewRoles": [
                            "Admin", "Librarians"
                        ]
                    }
                };
                const response = yield axios_1.default({
                    method: 'post',
                    url: createUrl,
                    headers: {
                        'Authorization': config.authorization
                    },
                    data: data
                });
                sails.log.debug(response['data']);
                if (response['data'] && response['data']['oid']) {
                    return { success: true, oid: response['data']['oid'] };
                }
                else {
                    return { error: true, errorMessage: response['message'] };
                }
            });
        }
        updateMeta(config, recordId, metaMetadata) {
            return __awaiter(this, void 0, void 0, function* () {
                const updateMetaUrl = config.brandingAndPortalUrl + `/api/records/objectmetadata/${recordId}`;
                const response = yield axios_1.default({
                    method: 'put',
                    url: updateMetaUrl,
                    headers: {
                        'Authorization': config.authorization
                    },
                    data: metaMetadata
                });
                sails.log.debug(response['data']);
                if (response['data']) {
                    return { success: true };
                }
                else {
                    return { error: true, errorMessage: response['message'] };
                }
            });
        }
        saveDataStream(config, exportConfig, recordId, notebook_file, meta) {
            return __awaiter(this, void 0, void 0, function* () {
                const filePath = path.join(exportConfig.exportDir, `${notebook_file}.zip`);
                const saveStreamUrl = config.brandingAndPortalUrl + `/api/records/datastreams/${recordId}`;
                const fileUpload = fs.createReadStream(filePath);
                const formData = new FormData();
                formData.append("attachmentFields", fileUpload);
                formData.append('isc', meta.isc);
                formData.append('type', 'attachment');
                const response = yield axios_1.default({
                    method: 'post',
                    url: saveStreamUrl,
                    headers: Object.assign({ 'Authorization': config.authorization }, formData.getHeaders()),
                    data: formData
                });
                if (response['data']) {
                    if (response['data']['message']) {
                        const res = response['data']['message'];
                        if (res['success']) {
                            return { success: true, message: 'file uploaded', fileIds: res['fileIds'] };
                        }
                        else {
                            return { error: true, errorMessage: res['message'] };
                        }
                    }
                    else {
                        return { error: true, errorMessage: response['message'] };
                    }
                }
                else {
                    return { error: true, errorMessage: response['message'] };
                }
            });
        }
        listDataStream(config, recordId) {
            return __awaiter(this, void 0, void 0, function* () {
                const saveStreamUrl = config.brandingAndPortalUrl + `/api/records/datastreams/${recordId}`;
                const response = yield axios_1.default({
                    method: 'put',
                    url: saveStreamUrl,
                    headers: {
                        'Authorization': config.authorization
                    }
                });
                if (response['data']) {
                    return { success: true, records: response['data']['records'], summary: response['data']['summary'] };
                }
                else {
                    return { error: true, errorMessage: response['message'] };
                }
            });
        }
        updateDataRecord(config, recordId, metadata) {
            return __awaiter(this, void 0, void 0, function* () {
                const updateMetadataUrl = config.brandingAndPortalUrl + `/api/records/metadata/${recordId}`;
                const response = yield axios_1.default({
                    method: 'put',
                    url: updateMetadataUrl,
                    headers: {
                        'Authorization': config.authorization,
                        'Content-type': 'application/json'
                    },
                    data: metadata
                });
                if (response['data']) {
                    return { success: true };
                }
                else {
                    return { error: true, errorMessage: response['message'] };
                }
            });
        }
    }
    Services.LabarchivesService = LabarchivesService;
})(Services = exports.Services || (exports.Services = {}));
module.exports = new Services.LabarchivesService().exports();
