import {Component, Input} from '@angular/core';


@Component({
  selector: 'labarchives-list',
  template: `
    <div class="">
      <table class="table">
        <thead>
        <tr>
          <ng-container *ngFor="let header of columns">
            <th>{{ header.label }}</th>
          </ng-container>
          <th>{{ rdmpLinkLabel }}</th>
        </tr>
        </thead>
        <tbody>
        <tr *ngFor="let item of workspaces">
          <ng-container *ngFor="let column of columns">
            <td *ngIf="column.show != false">
                <span *ngIf="column.link; else noProcessing "><a target="_blank" rel="noopener noreferrer"
                                                                 href="{{ item[column.property] }}">{{ item[column.property]
                  }}</a></span>
              <ng-template #multivalue></ng-template>
              <ng-template #noProcessing><span>{{ item[column.property] }}</span></ng-template>
            </td>
          </ng-container>
          <td>
            <span *ngIf="item.rdmp.info && item.rdmp.info.rdmp; else isNotLinked ">
              <button disabled type="button" class="btn btn-success btn-block"
                      *ngIf="item.rdmp.info.rdmp === rdmp"> Linked </button>
              <button disabled type="button" class="btn btn-info btn-block" *ngIf="item.rdmp.info.rdmp != rdmp"> Linked to another RDMP</button>
            </span>
            <ng-template #isNotLinked>
              <button type="button" class="btn btn-info btn-block" (click)="linkWorkspace(item)"> Link</button>
            </ng-template>
          </td>
        </tr>
        </tbody>
      </table>
      <div *ngIf="loading" class="">
        <img class="center-block" src="/images/loading.svg">
      </div>
      <p *ngIf="failedObjects.length > 0">There were {{ failedObjects.length }} records that failed to
        load</p>
      <p *ngIf="accessDeniedObjects.length > 0">There were {{ accessDeniedObjects.length }} records that
        you do not have access to</p>
      <div class="">
        <button type="button" class="btn btn-default" (click)="listWorkspaces()"><i
          class="fa fa-refresh"></i>&nbsp;{{ syncLabel }}
        </button>
      </div>
    </div>
  `
})
export class LabarchivesListComponent {

  columns: any;
  syncLabel: any;
  accessDeniedObjects: any = [];
  failedObjects: any = [];
  rdmpLinkLabel: string;

  loading: boolean;
  rdmp: string;
  workspaces: any;

  @Input() user: any;

  constructor() {
    this.columns = [
      {'label': 'Name', 'property': 'name'},
      {'label': 'Description', 'property': 'description'},
      {'label': 'Location', 'property': 'web_url', 'link': 'true'}
    ];
    this.rdmpLinkLabel = 'Plan';
    this.syncLabel = 'Sync';

  }

  listWorkspaces() {
    return [
      {name: 'notebook', description: 'notebook description', web_url: 'the route of the notebook', rdmp: {info:''}},
      {name: 'notebook2', description: 'notebook description 2 ', web_url: 'the route of the notebook', rdmp: {info:''}}
    ];
  }

  linkWorkspace(item: any) {
    alert('linking')
  }

  ngOnInit() {
    this.workspaces = this.listWorkspaces();
  }

}
