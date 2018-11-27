import {Output, EventEmitter, Component, OnInit, Inject, Injector} from '@angular/core';
import {FormGroup, FormControl, Validators, NgForm} from '@angular/forms';
import {SimpleComponent} from '../shared/form/field-simple.component';
import {FieldBase} from '../shared/form/field-base';

export class LabarchivesLoginField extends FieldBase<any> {

  valid = true;
  username: string;
  usernameLabel: string = 'Username';
  password: string;
  passwordLabel: string = 'Password';

  submitted = false;

  user: any;

  @Output() userLogin = new EventEmitter<any>();

  constructor(options: any, injector: any) {
    super(options, injector);
  }

  onSubmit() {
    this.user = {username: this.username, password: this.password};
    this.user.loggedIn = true;
    this.userLogin.emit(this.user);
    this.submitted = true;
  }

  userIsValid() {
    return true;
  }

}

@Component({
  selector: 'ws-labarchiveslogin',
  template: `
    <form (ngSubmit)="field.onSubmit()" #form="ngForm">
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
        <button type="submit" [disabled]="!field.valid" class="btn btn-primary">Login</button>
      </div>
      <div>
        <p></p>
      </div>
      <div class="form-group">
        <button type="submit" [disabled]="!field.valid" class="btn btn-primary">Login trough UTS</button>
      </div>
      <div class="errorMessage" *ngIf="!field.valid">Field is required</div>
      <div>
        <p></p>
      </div>
    </form>
  `
})
export class LabarchivesLoginComponent extends SimpleComponent {
  field: LabarchivesLoginField;

  ngOnInit() {
  }
}
