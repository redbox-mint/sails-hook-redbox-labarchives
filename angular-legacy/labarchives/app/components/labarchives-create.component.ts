import {Input, Output, Component, OnInit, Inject, Injector, EventEmitter} from '@angular/core';
import {SimpleComponent} from '../../../shared/form/field-simple.component';
import {FieldBase} from '../../../shared/form/field-base';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import * as _ from "lodash";

import {Checks} from './helpers';
import {LabarchivesService} from '../labarchives.service';

// STEST-22
declare var jQuery: any;

/**
 * Contributor Model
 *
 * @author <a target='_' href='https://github.com/moisbo'>moisbo</a>
 *
 */
export class LabarchivesCreateField extends FieldBase<any> {

  createNotebookHelp: string;
  createNotebookHelp2: string;
  createNotebookLabel: string;
  notebookLabel: string;
  supervisorLabel: string;
  creatingLabel: string;
  linkingLabel: string;

  closeLabel: string;
  processing: boolean = false;
  workspaceDetailsTitle: string;
  workspaceDefinition: string;
  currentWorkspace: any;
  processingLabel: string;
  processingMessage: string;
  processingStart: boolean = true;
  processingSuccess: boolean;
  processingFinished: boolean = false;
  processingFail: string;
  processingStatus: string;
  processingNoPermission: string;

  supervisorFailMessage: string;

  checks: Checks;
  rdmp: string;
  userEmail: string;
  notebookName: string;
  supervisorEmail: string;
  errorMessageMap = {
    createErrorMessage: 'There was an error creating your notebook'
  };
  errorMessages: Array<string> = [];

  @Input() LinkItem: EventEmitter<any> = new EventEmitter<any>();
  @Output() link: EventEmitter<any> = new EventEmitter<any>();

  labarchivesService: LabarchivesService;

  constructor(options: any, injector: any) {
    super(options, injector);
    this.labarchivesService = this.getFromInjector(LabarchivesService);
    this.closeLabel = 'Close';
    this.processing = false;
    this.workspaceDetailsTitle = 'Workspace';
    this.workspaceDefinition = '';
    this.currentWorkspace = {};

    this.createNotebookHelp = options['createNotebookHelp'] || '';
    this.createNotebookHelp2 = options['createNotebookHelp2'] || '';
    this.createNotebookLabel = options['createNotebookLabel'] || '';
    this.notebookLabel = options['notebookLabel'] || '';
    this.supervisorLabel = options['supervisorLabel'] || '';
    this.creatingLabel = options['creatingLabel'] || '';
    this.linkingLabel = options['linkingLabel'] || '';

    this.supervisorFailMessage = options['supervisorFailMessage'] || 'Supervisor has not logged in to LabArchives';
    this.processingSuccess = options['processingSuccess'] || 'Success';
    this.processingFail = options['processingFail'] || 'There was a problem linking your workspace, please try again later';
    this.processingStatus = '';
    this.processingNoPermission = options['processingNoPermission'] || 'You are not allowed to modify this item'
    this.processingLabel = options['processingLabel'] || 'Processing...';
    this.processingMessage = '';
    this.errorMessageMap = options['errorMessageMap'] || this.errorMessageMap;
    this.checks = new Checks();
  }

  init() {
    this.rdmp = this.fieldMap._rootComp.rdmp;
  }

  registerEvents() {
    this.fieldMap['List'].field['create'].subscribe(this.createModal.bind(this));
  }

  createFormModel(valueElem: any = undefined): any {
    if (valueElem) {
      this.value = valueElem;
    }

    this.formModel = new FormControl(this.value || []);

    if (this.value) {
      this.setValue(this.value);
    }

    return this.formModel;
  }

  setValue(value: any) {
    this.formModel.patchValue(value, {emitEvent: false});
    this.formModel.markAsTouched();
  }

  setEmptyValue() {
    this.value = [];
    return this.value;
  }

  async createModal() {
    const rdmpInfo = await this.labarchivesService.rdmpInfo(this.rdmp);
    const userInfo = await this.labarchivesService.getUserInfo();
    const user = userInfo['user'];
    this.userEmail = user['email'];
    const recordMetadata = rdmpInfo['recordMetadata'];
    if (recordMetadata['contributor_ci'] && recordMetadata['contributor_ci']['email']) {
      this.supervisorEmail = recordMetadata['contributor_ci']['email'];
    }
    jQuery('#createModal').modal('show');
  }

  async createNotebook() {
    this.processing = false;
    if (this.validate()) {
      this.processing = true;
      this.processingStart = true;
      try {
        this.processingStatus = 'Creating Notebook...';
        const createNotebook = await this.labarchivesService.createNotebook(this.rdmp, this.notebookName, this.supervisorEmail, this.userEmail);
        console.log(createNotebook);
        if (createNotebook.status === false) {
          this.processingStatus = "";
          this.errorMessages = [this.errorMessageMap['createErrorMessage']];
          if (createNotebook.message) {
            this.errorMessages = [createNotebook.message]; 
          }
          this.processing = false;
          return;
        }
        this.processingStart = false;
        this.processingFinished = true;
        this.processingStatus = 'Your notebook has been created';
        jQuery('#createModal').modal('hide');
        this.link.emit({name: createNotebook.name, id: createNotebook.nb});
      } catch (e) {
        this.processingStatus = this.errorMessageMap['createErrorMessage'];
      }
    } else {
      this.processingFail = '';
    }
  }

  validate() {
    this.errorMessages = [];
    if (this.notebookName) {
      //other validations
    } else {
      this.errorMessages.push('verify Notebook Name');
    }
    if (this.supervisorEmail) {
      //other validations
    } else {
      this.errorMessages.push('supervisor Email is blank');
    }
    if (this.errorMessages.length > 0) {
      return false;
    } else {
      return true;
    }
  }
}

/**
 * Component that Links Workspaces to Workspace Records in Stash
 */
@Component({
  selector: 'ws-labarchivescreate',
  template: `
    <div id="createModal" class="modal fade" data-keyboard="false">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title">Create Workspace</h4>
          </div>
          <div class="modal-body">
            <div *ngIf="field.processingStart">
              <h5>{{ field.createNotebookHelp }}</h5>
              <p>{{ field.createNotebookHelp2 }}</p>
              <div class="form-group">
                <label>{{ field.notebookLabel }}</label>
                <input type="text" class="form-control" [(ngModel)]="field.notebookName" name="notebookName" ngModel
                       attr.aria-label="{{ field.notebookName }}">
              </div>
              <div class="form-group">
                <label>{{ field.supervisorLabel }}</label>
                <input type="text" class="form-control" [(ngModel)]="field.supervisorEmail" name="supervisorLabel"
                       ngModel
                       attr.aria-label="{{ field.supervisorEmail }}" disabled="true">
              </div>
              <div class="form-group">
                <button *ngIf="waitForProcessing && field.errorMessages.length == 0" type="button" class="form-control btn btn-block btn-primary"
                        (click)="field.createNotebook()"
                        attr.aria-label="{{ field.createNotebookLabel }}">{{ field.createNotebookLabel }}</button>
              </div>
              <div class="form-group">
                <div>{{ field.processingStatus }}</div>
              </div>
              <div class="form-group" *ngIf="field.errorMessages.length > 0">
                <div class="alert alert-danger" role="alert">
                  <ul>
                    <li *ngFor="let msg of field.errorMessages">{{msg}}</li>
                  </ul>
                </div>
              </div>
            </div>
            <div *ngIf="field.processingFinished"></div>
          </div>
          <div class="modal-footer">
            <span *ngIf="field.processing; then waitForProcessing; else finishProcessing"></span>
            <ng-template #finishProcessing>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ field.closeLabel }}</button>
            </ng-template>
            <ng-template #waitForProcessing>
              <button type="button" class="btn btn-secondary disabled" data-bs-dismiss="modal">{{ field.closeLabel }}
              </button>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LabarchivesCreateComponent extends SimpleComponent {
  field: LabarchivesCreateField;

  ngOnInit() {
    this.field.init();
    this.field.registerEvents();
  }
}
