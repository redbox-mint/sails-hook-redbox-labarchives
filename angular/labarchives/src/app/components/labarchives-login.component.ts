import {Component, Output, EventEmitter} from '@angular/core';


@Component({
  selector: 'labarchives-login',
  template: `
    <form (ngSubmit)="onSubmit()" #form="ngForm">
      <div class="form-group">
        <label>{{ usernameLabel }}</label>
        <input type="text" class="form-control" [(ngModel)]="username" name="username"
               attr.aria-label="{{ usernameLabel }}">
      </div>
      <div class="form-group">
        <label>{{ passwordLabel }}</label>
        <input type="password" class="form-control" [(ngModel)]="password" name="password"
               attr.aria-label="{{ passwordLabel }}">
      </div>
      <div class="form-row">
        <button type="submit" [disabled]="!valid" class="btn btn-primary">Login</button>
      </div>
      <div class="errorMessage" *ngIf="!isValid">{{valid}} is required</div>
    </form>
  `
})
export class LabarchivesLoginComponent {

  valid = true;
  username: string;
  usernameLabel: string = 'Username';
  password: string;
  passwordLabel: string = 'Password';

  submitted = false;

  user: any;

  @Output() userLogin = new EventEmitter<any>();

  onSubmit() {
    this.user = {username: this.username, password: this.password};
    this.user.loggedIn = true;
    this.userLogin.emit(this.user);
    this.submitted = true;
  }

  isValid() {
    return true;
  }

}
