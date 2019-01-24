export class UserInfo {

  id: string;
  orcid: string;
  fullName: string;

  constructor(id: string, orcid: string, fullName: string) {
    this.id = id;
    this.orcid = orcid;
    this.fullName = fullName;
  }
}
