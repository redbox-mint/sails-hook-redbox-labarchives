import {Output, EventEmitter, Component, OnInit, Inject, Injector, Input} from '@angular/core';
import {FormGroup, FormControl, Validators, NgForm} from '@angular/forms';
import {SimpleComponent} from '../shared/form/field-simple.component';
import {FieldBase} from '../shared/form/field-base';

export class LabarchivesListField extends FieldBase<any> {

  columns: any;
  syncLabel: any;
  accessDeniedObjects: any = [];
  failedObjects: any = [];
  rdmpLinkLabel: string;

  loading: boolean;
  rdmp: string;
  workspaces: any;

  @Input() user: any;

  constructor(options: any, injector: any) {
    super(options, injector);
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

  init() {
    this.workspaces = this.listWorkspaces();
  }

}


@Component({
  selector: 'ws-labarchiveslist',
  template: `
    <div class="">
      <table class="table">
        <thead>
        <tr>
          <ng-container *ngFor="let header of field.columns">
            <th>{{ header.label }}</th>
          </ng-container>
          <th>{{ field.rdmpLinkLabel }}</th>
        </tr>
        </thead>
        <tbody>
        <tr *ngFor="let item of field.workspaces">
          <ng-container *ngFor="let column of field.columns">
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
                      *ngIf="item.rdmp.info.rdmp === field.rdmp"> Linked </button>
              <button disabled type="button" class="btn btn-info btn-block" *ngIf="item.rdmp.info.rdmp != field.rdmp"> Linked to another RDMP</button>
            </span>
            <ng-template #isNotLinked>
              <button type="button" class="btn btn-info btn-block" (click)="field.linkWorkspace(item)"> Link</button>
            </ng-template>
          </td>
        </tr>
        </tbody>
      </table>
      <div *ngIf="field.loading" class="">
        <img class="center-block" src="/images/loading.svg">
      </div>
      <p *ngIf="field.failedObjects.length > 0">There were {{ field.failedObjects.length }} records that failed to
        load</p>
      <p *ngIf="field.accessDeniedObjects.length > 0">There were {{ field.accessDeniedObjects.length }} records that
        you do not have access to</p>
      <div class="">
        <button type="button" class="btn btn-default" (click)="field.listWorkspaces()"><i
          class="fa fa-refresh"></i>&nbsp;{{ field.syncLabel }}
        </button>
      </div>
      <div>
        <p></p>
      </div>
    </div>
  `
})
export class LabarchivesListComponent extends SimpleComponent {
  field: LabarchivesListField;

  ngOnInit() {
    this.field.init();
  }
}
