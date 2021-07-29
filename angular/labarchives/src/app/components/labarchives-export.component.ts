import {Output, EventEmitter, Component, OnInit, Inject, Injector, Input, AfterContentInit} from '@angular/core';
import {FormGroup, FormControl, Validators, NgForm} from '@angular/forms';
import {SimpleComponent} from '../shared/form/field-simple.component';
import {FieldBase} from '../shared/form/field-base';
import {LabarchivesService} from '../labarchives.service';

export class LabarchivesExportField extends FieldBase<any> {
  loading: boolean;
  workspaces: any[];
  rdmp: string;
  workspaceId: string;
  nbId: string;
  workspace: any;
  exportStatus: string;
  action: string;

  processingExport: boolean;
  processingZipAndReturn: boolean;
  processingDataRecord: boolean;
  zipReturnInterval: any;
  processedNotebook: string;
  notebookExported: boolean;
  notebookProcessed: boolean;
  dataRecordSaved: boolean;
  requestGroupForm: FormGroup;
  retention: FormControl;
  retentionValues: any;
  disposal: FormControl;
  isc: FormControl;
  iscValues: any;
  dataRecord: string;
  dataRecordError: boolean;
  pleaseSelectLabel: string;
  dataRecordURL: string;
  anyError: string;

  @Output() list: EventEmitter<any> = new EventEmitter<any>();

  labarchivesService: LabarchivesService;

  constructor(options: any, injector: any) {
    super(options, injector);
    this.labarchivesService = this.getFromInjector(LabarchivesService);
    this.iscValues = [
      {name: 'Confidential', value: 'confidential'},
      {name: 'Sensitive', value: 'sensitive'},
      {name: 'Internal', value: 'internal'},
      {name: 'Public', value: 'public'}
    ];
    this.retentionValues = [
      {name: '1 year', value: '1year'},
      {name: '5 years', value: '5years'},
      {name: '7 years', value: '7years'},
      {name: '25 years', value: '25years'},
      {name: 'Permanent', value: 'permanent'}
    ];
    this.pleaseSelectLabel = 'Please Select';
  }

  registerEvents() {
    this.fieldMap['List'].field['goToExporter'].subscribe(this.showNotebook.bind(this));
  }

  init() {
    this.rdmp = this.fieldMap._rootComp.rdmp;
    this.action = this.fieldMap._rootComp.action;
    this.workspaceId = this.fieldMap._rootComp.workspaceId;
    this.restartExport();
    if (this.action === 'archive') {
      console.log('loaded exporter');
      this.showNotebook();
    } else {
      console.log('loaded list');
      this.list.emit();
    }
    this.loading = true;
  }

  showNotebook(item?) {
    this.retention = new FormControl('');
    this.disposal = new FormControl('');
    this.isc = new FormControl('');

    this.requestGroupForm = new FormGroup({retention: this.retention, disposal: this.disposal, isc: this.isc});
    this.nbId = null;
    if (item.id) {
      this.nbId = item.id;
      this.labarchivesService.notebookInfo(this.rdmp, this.nbId)
        .then((response) => {
          if (response.nb && response.nb.notebooks && response.nb.notebooks.notebook) {
            this.workspace = response.nb.notebooks.notebook;
          }
        }).catch((e) => {
        console.error(e);
      });
    } else {
      // Find the Id of the notebook
      this.rdmp = this.fieldMap._rootComp.rdmp;
      this.workspaceId = this.fieldMap._rootComp.workspaceId;
      this.loading = true;
      this.workspace = null;
      console.log('showNotebook');
      this.labarchivesService.findNotebook(this.rdmp, this.workspaceId)
        .then((response) => {
          this.workspace = response.nb.notebook;
        }).catch((e) => {
        this.anyError = e.message;
        console.error(e);
      });
    }
  }

  requiredFields() {
    return this.retention.value && this.disposal.value && this.isc.value;
  }

  exportNotebook() {
    if (!this.requiredFields()) {
      this.anyError = 'Please input required fields: Retention Period, Disposal Date and Security Classification';
    } else {
      this.anyError = null;
      this.processingExport = true;
      this.labarchivesService.exportNotebook(this.rdmp, this.nbId)
        .then((response) => {
          if (response.status) {
            this.processedNotebook = response.nb;
            this.notebookExported = true;
          } else {
            console.log('there was an error starting the export');
          }
          this.processingExport = false;
          return this.zipAndReturn();
        }).catch((e) => {
        console.error(e);
        this.anyError = e.message;
        this.processingExport = false;
      });
    }
  }

  zipAndReturn() {
    this.processingZipAndReturn = true;
    if (this.processedNotebook) {
      this.labarchivesService.zipNotebook(this.processedNotebook)
        .then((zip) => {
          this.exportStatus = zip;
          this.zipReturnInterval = setInterval(() => {
            this.labarchivesService.returnNotebook(this.processedNotebook)
              .then((returnNotebook) => {
                if (returnNotebook.status) {
                  clearInterval(this.zipReturnInterval);
                  this.exportStatus = returnNotebook;
                  this.notebookProcessed = true;
                  this.processingZipAndReturn = false;
                  return this.createDataRecord();
                }
              }).catch((e) => {
              console.error(e);
              this.processingZipAndReturn = false;
            });
          }, 1000);
        }).catch((e) => {
        this.anyError = e.message;
        console.error(e);
      });
    } else {
      console.log('notebook not yet processed');
    }
  }

  async createDataRecord() {
    this.processingDataRecord = true;
    const notebookTitle = this.workspace.name;
    if (this.exportStatus['nb']) {
      const notebookFile = this.exportStatus['nb'];
      const rdmpTitle = this.fieldMap._rootComp.rdmpMetadata['title'];
      const isHdr = this.fieldMap._rootComp.rdmpMetadata['project_hdr'] || false;
      const contributor_ci = this.fieldMap._rootComp.rdmpMetadata['contributor_ci'];
      const contributor_data_manager = this.fieldMap._rootComp.rdmpMetadata['contributor_data_manager'];
      const keywords = this.fieldMap._rootComp.rdmpMetadata['finalKeywords'] || [];
      const dataRecord = await this.labarchivesService.createDataRecord(
        this.rdmp,
        rdmpTitle,
        isHdr,
        notebookFile,
        notebookTitle,
        this.retention.value.value,
        this.disposal.value,
        this.isc.value.value,
        contributor_ci,
        contributor_data_manager,
        keywords
      );
      if (dataRecord.status) {
        this.dataRecord = dataRecord.recordId;
        this.dataRecordURL = this.labarchivesService.recordURL + '/' + this.dataRecord;
        this.dataRecordSaved = true;
      } else {
        this.anyError = dataRecord.message;
        this.dataRecordError = true;
      }
    } else {
      alert('no notebook exported');
    }
    this.processingDataRecord = false;
  }

  checkExport(item) {
    this.workspaces = null;
    this.labarchivesService.checkExport(this.workspace)
      .then((response) => {
        console.log(response);
        this.exportStatus = 'working';
      })
      .catch((error) => {
        console.error(error);
      });
  }

  restartExport() {
    this.dataRecordURL = null;
    this.processingDataRecord = false;
    this.processingZipAndReturn = false;
    this.processingDataRecord = false;
    this.notebookExported = false;
    this.dataRecordSaved = false;
    this.notebookProcessed = false;
    this.dataRecordError = false;
    this.anyError = null;
  }

  showWorkspaces() {
    this.workspace = null;
    this.list.emit();
  }

  logOut() {
    alert('not implemented');
  }

}


@Component({
  selector: 'ws-labarchivesexport',
  template: `
    <div class="container-fluid">
      <div *ngIf="field.workspace" class="row">
        <form [formGroup]="field.requestGroupForm"
              id="form"
              novalidate autocomplete="off">
          <h2>Export your notebook: <strong>{{ field.workspace.name }}</strong></h2>
          <div class="container-fluid">
            <div class="row">
              <div class="col-sm-4 col-md-4">
                <div class="form-group">
                  <label>Retention Period:</label>
                  <select [formControl]="field.retention"
                          class="form-control">
                    <option [ngValue]="null" [selected]="true">{{ field.pleaseSelectLabel }}</option>
                    <option *ngFor="let t of field.retentionValues"
                            [ngValue]="t">{{t.name}}</option>
                  </select>
                </div>
              </div>
              <div class="col-sm-4 col-md-4">
                <div class="form-group">
                  <label>Disposal Date:</label>
                  <datetime #dateTime [formControl]="field.disposal"
                            [timepicker]="false"
                            [datepicker]="{format: 'dd/mm/yyyy', icon: 'fa fa-calendar', autoclose: true}"
                            [hasClearButton]="false"></datetime>
                </div>
              </div>
              <div class="col-sm-4 col-md-4">
                <div class="form-group">
                  <label>Security Classification:</label>
                  <select [formControl]="field.isc"
                          class="form-control">
                    <option [ngValue]="null" [selected]="true">{{ field.pleaseSelectLabel }}</option>
                    <option *ngFor="let t of field.iscValues"
                            [ngValue]="t">{{t.name}}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="container-fluid">
            <div class="row">
              <div class="col-sm-4 col-md-4">
                <div class="card">
                  <div class="panel panel-default">
                    <div class="panel-heading">
                      <h5 class="panel-title card-title" style="margin-top: 1px">
                        <span>Export</span>
                      </h5>
                    </div>
                    <div class="panel-body" [ngClass]="field.processingExport === true ? 'overlay-div' : ''">
                      <div class="text-center">
                        <i class="fa fa-book fa-5x" aria-hidden="true"></i>
                        <div class="card-body" style="margin-bottom: auto;">
                          <h5 class="card-title" style="margin-top: 2px">
                            <span>Generate Export</span>
                          </h5>
                        </div>
                        <span *ngIf="!field.notebookExported && !field.processingExport">
                          <i class="fa fa-circle-o fa-4x" style="color:#cccccc"></i>
                        </span>
                        <span *ngIf="field.notebookExported">
                          <i class="fa fa-check fa-4x" style="color:green"></i>
                        </span>
                        <span *ngIf="field.processingExport">
                          <i class="fa fa-spinner fa-spin fa-4x"></i>
                        </span>
                      </div>
                    </div>
                    <div class="card-footer" style="margin-top: auto;">
                      <button (click)="field.exportNotebook()"
                              [attr.disabled]="field.processingExport || field.notebookExported ? '' : null"
                              class="btn btn-block btn-primary">Export Notebook
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-sm-4 col-md-4">
                <div class="card">
                  <div class="panel panel-default">
                    <div class="panel-heading">
                      <h5 class="panel-title card-title" style="margin-top: 1px">
                        <span>Process</span>
                      </h5>
                    </div>
                    <div class="panel-body" [ngClass]="field.processingZipAndReturn ? 'overlay-div' : ''">
                      <div class="text-center">
                        <i class="fa fa-file-archive-o fa-5x" aria-hidden="true"></i>
                        <div class="card-body" style="margin-bottom: auto;">
                          <h5 class="card-title" style="margin-top: 2px">
                            <span>Process {{field.workspace.name }}</span>
                          </h5>
                        </div>
                        <span *ngIf="!field.notebookProcessed && !field.processingZipAndReturn">
                          <i class="fa fa-circle-o fa-4x" style="color:#cccccc"></i>
                        </span>
                        <span *ngIf="field.notebookProcessed">
                          <i class="fa fa-check fa-4x" style="color:green"></i>
                        </span>
                        <span *ngIf="field.processingZipAndReturn">
                          <i class="fa fa-spinner fa-spin fa-4x"></i>
                        </span>
                      </div>
                    </div>
                    <div class="card-footer" style="margin-top: auto;">
                      <button (click)="field.zipAndReturn()"
                              [attr.disabled]="field.processingZipAndReturn || field.notebookProcessed ? '' : null"
                              class="btn btn-block btn-primary">Process Notebook
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-sm-4 col-md-4">
                <div class="card">
                  <div class="panel panel-default">
                    <div class="panel-heading">
                      <h5 class="panel-title card-title" style="margin-top: 1px">
                        <span>Register</span>
                      </h5>
                    </div>
                    <div class="panel-body" [ngClass]="field.processingDataRecord ? 'overlay-div' : ''">
                      <div class="text-center">
                        <i class="fa fa-floppy-o fa-5x" aria-hidden="true"></i>
                        <div class="card-body" style="margin-bottom: auto;">
                          <h5 class="card-title" style="margin-top: 2px">
                            <span>Create Data Record</span>
                          </h5>
                        </div>
                        <span *ngIf="!field.dataRecordSaved && !field.processingDataRecord && !field.dataRecordError">
                          <i class="fa fa-circle-o fa-4x" style="color:#cccccc"></i>
                        </span>
                        <span *ngIf="field.dataRecordSaved">
                          <i class="fa fa-check fa-4x" style="color:green"></i>
                        </span>
                        <span *ngIf="field.dataRecordError">
                          <i class="fa fa-exclamation fa-4x" style="color:red"></i>
                        </span>
                        <span *ngIf="field.processingDataRecord">
                          <i class="fa fa-spinner fa-spin fa-4x"></i>
                        </span>
                      </div>
                    </div>
                    <div class="card-footer" style="margin-top: auto;">
                      <button (click)="field.createDataRecord()"
                              [attr.disabled]="field.processingDataRecord || field.dataRecordSaved ? '' : null"
                              class="btn btn-block btn-primary">Create Data Record
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      <div class="container-fluid text-center">
        <div class="row">
          <div *ngIf="field.dataRecordURL" class="col-sm-12 alert alert-success">
            <p>Data Record generated; <a class="underline" href="{{ field.dataRecordURL }}">
              click here to open</a></p>
          </div>
        </div>
        <div class="row">
          <div *ngIf="field.anyError" class="col-sm-12 alert alert-danger">
            <p>
              {{ field.anyError }}
            </p>
          </div>
        </div>
      </div>
      <div class="container-fluid">
        <div class="row">&nbsp;</div>
        <div class="row">
          <button (click)="field.restartExport()"
                  class="btn btn-secondary">Restart Export
          </button>
          <button (click)="field.showWorkspaces()"
                  class="btn btn-primary">Back to your Notebooks
          </button>
        </div>
        <div class="row">&nbsp;</div>
      </div>
    </div>
  `,
  styles: ['.overlay-div { height:100%; width: 100%; background-color:#ccc; opacity:.7;}']
})
export class LabarchivesExportComponent extends SimpleComponent implements OnInit, AfterContentInit {
  field: LabarchivesExportField;

  ngOnInit() {
    this.field.registerEvents();
  }

  ngAfterContentInit() {
    this.field.init();
  }

}
