export class UserInfo {

  id: string;
  orcid: string;
  fullName: string;
  notebooks: Array<Notebook>;

  constructor(id: string, orcid: string, fullName: string, notebooks: any) {
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

class Notebook {
  constructor(public id: string,
              public name: string,
              public isDefault: boolean) {
  }
}
