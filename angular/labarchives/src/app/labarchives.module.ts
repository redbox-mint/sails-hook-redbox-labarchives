import {BrowserModule} from '@angular/platform-browser';
import {ReactiveFormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import { FormsModule }   from '@angular/forms';

import {LabarchivesFormComponent} from './labarchives-form.component';
import {LabarchivesLoginComponent} from './components/labarchives-login.component';
import {LabarchivesListComponent} from './components/labarchives-list.component';

@NgModule({
  declarations: [
    LabarchivesFormComponent, LabarchivesLoginComponent, LabarchivesListComponent
  ],
  imports: [
    BrowserModule, FormsModule
  ],
  providers: [],
  bootstrap: [LabarchivesFormComponent]
})
export class LabarchivesModule {
}
