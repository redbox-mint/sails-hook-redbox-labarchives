import {Component} from '@angular/core';

@Component({
  selector: 'labarchives',
  templateUrl: './labarchives-form.component.html',
  styleUrls: ['./labarchives-form.component.css']
})
export class LabarchivesFormComponent {
  user: any;

  constructor(){
    this.user = {}
  }

  loginUser(user){
    this.user = user;
  }
}
