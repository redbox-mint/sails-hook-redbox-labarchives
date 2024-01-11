import {Input, Output, Component, OnInit, Inject, Injector, EventEmitter} from '@angular/core';
import {SimpleComponent} from '../shared/form/field-simple.component';
import {FieldBase} from '../shared/form/field-base';
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
export class LabarchivesLinkField extends FieldBase<any> {

  closeLabel: string;
  processing: boolean;
  workspaceDetailsTitle: string;
  workspaceDefinition: string;
  currentWorkspace: any;
  processingLabel: string;
  processingMessage: string;
  processingSuccess: string;
  processingFail: string;
  processingStatus: string;
  processingNoPermission: string;

  checks: Checks;
  rdmp: string;

  @Input() LinkItem: EventEmitter<any> = new EventEmitter<any>();
  @Output() list: EventEmitter<any> = new EventEmitter<any>();

  labarchivesService: LabarchivesService;

  constructor(options: any, injector: any) {
    super(options, injector);
    this.labarchivesService = this.getFromInjector(LabarchivesService);
    this.closeLabel = 'Close';
    this.processing = false;
    this.workspaceDetailsTitle = 'Workspace';
    this.workspaceDefinition = '';
    this.currentWorkspace = {};
    this.processingLabel = options['processingLabel'] || 'Processing...';
    this.processingMessage = '';
    this.checks = new Checks();
    this.processingSuccess = options['processingSuccess'] || 'Success';
    this.processingFail = options['processingFail'] || 'There was a problem linking your workspace, please try again later';
    this.processingStatus = '';
    this.processingNoPermission = options['processingNoPermission'] || 'You are not allowed to modify this item'
  }

  init() {
    this.rdmp = this.fieldMap._rootComp.rdmp;
  }

  registerEvents() {
    this.fieldMap['List'].field['link'].subscribe(this.linkItem.bind(this));
    this.fieldMap['Create'].field['link'].subscribe(this.linkItem.bind(this));
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

  async linkItem(item: any) {
    try {
      jQuery('#linkModal').modal('show');
      this.processing = true;
      this.processingStatus = 'linking';
      const link = await this.labarchivesService.link(item, this.rdmp);
      this.processingStatus = 'done';
      this.checks.link = true;
      this.processing = false;
      if (link.status) {
        this.checks.linkCreated = true;
        this.checks.master = true;
        this.processingFail = undefined;
        this.list.emit();
      } else if(link.message === 'cannot insert node'){
        this.processingFail = this.processingNoPermission;
        this.checks.linkWithOther = true
      }
    } catch (e) {
      this.processing = false;
      this.checks.linkWithOther = true;
    }
  }
}

/**
 * Component that Links Workspaces to Workspace Records in Stash
 */
@Component({
  selector: 'ws-labarchiveslink',
  template: `
    <div id="linkModal" class="modal fade" data-keyboard="false">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title">Link Workspace</h4>
          </div>
          <div class="modal-body">
            <h5>{{ field.workspaceDetailsTitle }}</h5>
            <p *ngFor="let item of field.workspaceDefinition">{{ item.label }} :
              {{ field.currentWorkspace[item.name]}}</p>
            <h5 *ngIf="field.processing">{{ field.processingLabel }}</h5>
            <p *ngIf="field.processing">{{ field.processingMessage }}&nbsp;</p>
            <p class="alert alert-success" *ngIf="field.checks.linkCreated">{{ field.processingSuccess }}</p>
            <p class="alert alert-danger" *ngIf="field.processingStatus === 'done' && field.processingFail">
              {{ field.processingFail }}</p>
            <ng-template #isDone>
              <i class="fa fa-check-circle"></i>
            </ng-template>
            <ng-template #isSpinning>
              <i class="fa fa-spinner fa-spin"></i>
            </ng-template>
          </div>
          <div class="modal-footer">
            <span *ngIf="field.processing; then waitForProcessing; else finishProcessing"></span>
            <ng-template #finishProcessing>
              <button type="button" class="btn btn-secondary" data-dismiss="modal">{{ field.closeLabel }}</button>
            </ng-template>
            <ng-template #waitForProcessing>
              <button type="button" class="btn btn-secondary disabled" data-dismiss="modal">{{ field.closeLabel }}
              </button>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LabarchivesLinkComponent extends SimpleComponent {
  field: LabarchivesLinkField;

  ngOnInit() {
    this.field.init();
    this.field.registerEvents();
  }
}
