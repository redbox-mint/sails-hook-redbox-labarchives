"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserInfo {
    constructor(id, orcid, fullName, notebooks) {
        this.id = id;
        this.orcid = orcid;
        this.fullName = fullName;
        this.notebooks = notebooks['notebook'].map(nb => {
            const getDefault = nb['is-default'];
            const isDefault = getDefault['_'] !== 'false';
            return new Notebook(nb['id'], nb['name'], isDefault);
        });
    }
}
exports.UserInfo = UserInfo;
class Notebook {
    constructor(id, name, isDefault) {
        this.id = id;
        this.name = name;
        this.isDefault = isDefault;
    }
}
