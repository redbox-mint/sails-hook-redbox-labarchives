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
var Services;
(function (Services) {
    class LabarchivesService extends services.Services.Core.Service {
        constructor() {
            super();
            this._exportedMethods = [
                'login',
                'insertNode',
                'addEntry'
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
    }
    Services.LabarchivesService = LabarchivesService;
})(Services = exports.Services || (exports.Services = {}));
module.exports = new Services.LabarchivesService().exports();
