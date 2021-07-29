import {Output, EventEmitter, Component, OnInit, Inject, Injector, Input} from '@angular/core';
import {FormGroup, FormControl, Validators, NgForm} from '@angular/forms';
import {SimpleComponent} from '../shared/form/field-simple.component';
import {FieldBase} from '../shared/form/field-base';
import {LabarchivesService} from "../labarchives.service";

export class LabarchivesListField extends FieldBase<any> {

  loggedIn: boolean;

  columns: any;
  syncLabel: any;
  accessDeniedObjects: any = [];
  failedObjects: any = [];
  rdmpLinkLabel: string;

  loading: boolean;
  loadingChecks: boolean;
  labUser: any = {};
  rdmp: string;
  rdmpTitle: string;
  workspaces: any;
  linkedLabel: string;
  linkedAnotherLabel: string;
  linkLabel: string;
  linkProblem: string;
  defaultNotebookLabel: string;
  createNotebookLabel: string;
  exportStatus: string;

  @Input() user: any;
  @Output() link: EventEmitter<any> = new EventEmitter<any>();
  @Output() checkLoggedIn: EventEmitter<any> = new EventEmitter<any>();
  @Output() create: EventEmitter<any> = new EventEmitter<any>();
  @Output() goToExporter: EventEmitter<any> = new EventEmitter<any>();

  labarchivesService: LabarchivesService;

  constructor(options: any, injector: any) {
    super(options, injector);
    this.labarchivesService = this.getFromInjector(LabarchivesService);
    this.columns = [
      {'label': 'Name', 'property': 'name'},
      {'label': 'Default', 'property': 'isDefault'}
    ];
    this.rdmpLinkLabel = 'Plan';
    this.syncLabel = 'Sync';
    this.linkedLabel = options['linkedLabel'] || 'Linked';
    this.linkedAnotherLabel = options['linkedAnotherLabel'] || 'Linked to another workspace';
    this.linkLabel = options['linkLabel'] || 'Link Workspace';
    this.linkProblem = options['linkProblem'] || 'There was a problem checking the link';
    this.defaultNotebookLabel = options['defaultNotebookLabel'] || 'Default Notebook';
    this.createNotebookLabel = options['createNotebookLabel'] || 'Create Notebook';
  }

  registerEvents() {
    this.fieldMap['Login'].field['userLogin'].subscribe(this.listWorkspaces.bind(this));
    this.fieldMap['Link'].field['list'].subscribe(this.listWorkspaces.bind(this));
    this.fieldMap['Export'].field['list'].subscribe(this.listWorkspaces.bind(this));
  }

  init() {
    this.rdmp = this.fieldMap._rootComp.rdmp;
  }


  listWorkspaces() {
    this.loading = true;
    this.labarchivesService.rdmpInfo(this.rdmp).then(response => {
      this.fieldMap._rootComp.rdmpMetadata = response['recordMetadata'];
      this.rdmpTitle = this.fieldMap._rootComp.rdmpMetadata['title']
      return this.labarchivesService.list();
    }).then(response => {
      if (response.status) {
        const notebooks = response['notebooks']['notebook'];
        this.loggedIn = this.fieldMap._rootComp.loggedIn = true;
        this.checkLoggedIn.emit(true);
        this.workspaces = notebooks.map((nb) => {
          console.log(nb['is-default']['_']);
          return {
            id: nb['id'],
            name: nb['name'],
            isDefault: nb['is-default']['_'] == 'true' ? this.defaultNotebookLabel : '',
            rdmp: {info: ''}
          }
        });
        this.loading = false;
        this.checkLinks();
      } else {
        this.checkLoggedIn.emit(false);
        this.loading = false;
        throw new Error('cannot list');
      }
    }).catch(error => {
      this.loading = false;
      this.workspaces = null;
      this.checkLoggedIn.emit(false);
    });
  }

  linkWorkspace(item: any) {
    this.link.emit(item);
  }

  createWorkspace() {
    this.create.emit();
  }

  checkLinks() {
    this.loadingChecks = true;
    const links = this.workspaces.reduce((promise, w, index) => {
      return promise.then(() => {
        return this.labarchivesService.checkLink(this.rdmp, w['id'])
          .then((response) => {
            if (!response.status) {
              throw new Error('Error checking workspace');
            } else {
              const check = response['check'];
              if (check['link'] === 'linked') {
                this.workspaces[index]['linkedState'] = 'linked';
              } else {
                this.workspaces[index]['linkedState'] = 'link';
              }
            }
          })
          .catch((error) => {
            this.workspaces[index]['linkedState'] = 'problem';
          });
      });
    }, Promise.resolve());
    links.then(e => {
      console.log(e);
      this.loadingChecks = false;
    });
  }

  exporter(item) {
    this.workspaces = null;
    this.goToExporter.emit(item);
  }

  logOut() {
    alert('not implemented');
  }

}


@Component({
  selector: 'ws-labarchiveslist',
  template: `
    <div class="row">
      <h4>Current Data Plan Selected: {{ field.rdmpTitle }}</h4>
    </div>
    <div class="row">
      <div *ngIf="field.workspaces" class="col-lg-12">
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
                  <span *ngIf="column.link; else noProcessing ">
                    <a target="_blank" rel="noopener noreferrer"
                       href="{{ item[column.property] }}">{{ item[column.property]}}</a>
                  </span>
                  <ng-template #multivalue></ng-template>
                  <ng-template #noProcessing><span>{{ item[column.property] }}</span></ng-template>
                </td>
              </ng-container>
              <td>
                <span *ngIf="!item['linkedState']">
                  <button type="button" disabled class="btn btn-info btn-block" [name]="item['@id']">
                    <span><i class="fa fa-spinner fa-spin"></i></span></button>
                </span>
                <span *ngIf="item['linkedState'] === 'linked'">
                  <button type="button" disabled class="btn btn-success btn-block"
                          [name]="item['@id']">{{ field.linkedLabel }}</button>
                </span>
                <span *ngIf="item['linkedState'] === 'another'">
                  <button type="button" disabled class="btn btn-info btn-block"
                          [name]="item['@id']">{{ field.linkedAnotherLabel }}</button>
                </span>
                <span *ngIf="item['linkedState'] === 'link'">
                  <button type="button" class="btn btn-info btn-block" [name]="item['@id']"
                          (click)="field.linkWorkspace(item)">{{ field.linkLabel }}</button>
                </span>
                <span *ngIf="item['linkedState'] === 'problem'">
                  <button type="button" disabled class="btn btn-warning btn-block"
                          [name]="item['@id']">{{ field.linkProblem }}</button>
                </span>
              </td>
              <td>
                <button class="btn btn-primary btn-block" [disabled]="field.loadingChecks ? 'disabled': null"
                        (click)="field.exporter(item)">Export
                </button>
              </td>
            </tr>
            </tbody>
          </table>
          <div *ngIf="field.loading" class="">
            <img class="center-block" src="/images/loading.svg">
          </div>
          <div>
            <p *ngIf="field.failedObjects.length > 0">There were {{ field.failedObjects.length }} records that failed to
              load</p>
            <p *ngIf="field.accessDeniedObjects.length > 0">There were {{ field.accessDeniedObjects.length }} records
              that
              you do not have access to</p>
          </div>
        </div>
        <div class="row">
          <button class="btn btn-primary" type="button"
                  (click)="field.createWorkspace()">{{field.createNotebookLabel}}</button>
        </div>
        <p>&nbsp;</p>
<!--        <div class="row">-->
<!--          <button class="btn btn-secondary" type="button"-->
<!--                  (click)="field.logOut()">Revoke Login Consent-->
<!--          </button>-->
<!--        </div>-->
        <div class="row">&nbsp;</div>
      </div>
    </div>
  `
})
export class LabarchivesListComponent extends SimpleComponent implements OnInit {
  field: LabarchivesListField;

  ngOnInit() {
    this.field.registerEvents();
    //this.field.init();
  }

  ngAfterContentInit() {
    this.field.init();
  }

}
