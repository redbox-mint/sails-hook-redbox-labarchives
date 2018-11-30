import {Output, EventEmitter, Component, OnInit, Inject, Injector} from '@angular/core';
import {FormGroup, FormControl, Validators, NgForm} from '@angular/forms';
import {SimpleComponent} from '../shared/form/field-simple.component';
import {FieldBase} from '../shared/form/field-base';

declare var jQuery: any;

import {LabarchivesService} from "../labarchives.service";

export class LabarchivesLoginField extends FieldBase<any> {

  valid = true;
  username: string;
  usernameLabel: string = 'Username';
  password: string;
  passwordLabel: string = 'Password';

  submitted = false;
  errorMessage: string = undefined;
  closeLabel: string;

  user: any;
  loggedIn: boolean;
  labarchivesService: LabarchivesService;

  @Output() userLogin = new EventEmitter<any>();

  constructor(options: any, injector: any) {
    super(options, injector);
    this.closeLabel = 'Close';
    this.labarchivesService = this.getFromInjector(LabarchivesService);
  }

  async login(form) {
    const formValid = this.loginValid(form);
    if (formValid === '') {
      // TODO: Investigate this. Using this method to remove the trailing Base64 equals ==
      form.password = form.password.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
      this.user = {username: form.username, password: form.password};
      const login = await this.labarchivesService.login(this.user.username, this.user.password);
      if (login.status) {
        this.loggedIn = true;
        this.userLogin.emit(login.labUser);
        this.submitted = true;
        this.errorMessage = null;
      } else {
        this.errorMessage = login.message;
      }

    } else {
      this.errorMessage = formValid;
    }
  }

  loginValid(form) {
    if (!form.username) {
      return 'Please include username';
    }
    if (!form.password) {
      return 'Please include username';
    }
    return '';
  }

  loginViaInstitution() {
    jQuery('#institutionModal').modal('show');
  }

}

@Component({
  selector: 'ws-labarchiveslogin',
  template: `
    <div class="row">
      <div *ngIf="!field.loggedIn" class="col-md-5 col-md-offset-2">
        <form #form="ngForm">
          <div class="form-group">
            <label>{{ field.usernameLabel }}</label>
            <input type="text" class="form-control" ngModel name="username"
                   attr.aria-label="{{ field.usernameLabel }}">
          </div>
          <div class="form-group">
            <label>{{ field.passwordLabel }}</label>
            <input type="password" class="form-control" ngModel name="password"
                   attr.aria-label="{{ field.passwordLabel }}">
          </div>
          <div class="form-row">
            <p>
              <button (click)="field.login(form.value)" type="submit" [disabled]="!field.valid" class="btn btn-primary">
                Login via KEY
              </button>
              or
              <button (click)="field.loginViaInstitution()" type="submit" [disabled]="!field.valid"
                      class="btn btn-info">
                Login trough UTS
              </button>
            </p>
          </div>
          <div class="alert alert-danger" *ngIf="field.errorMessage">{{ field.errorMessage }}</div>
          <div>
            <p></p>
          </div>
        </form>
      </div>
    </div>
    <div id="institutionModal" class="modal fade">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title">Login via UTS</h4>
          </div>
          <div class="modal-body">
            <p>Login not available please use Key method</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">{{ field.closeLabel }}</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LabarchivesLoginComponent extends SimpleComponent {
  field: LabarchivesLoginField;

  ngOnInit() {
  }
}
