import {BrowserModule} from '@angular/platform-browser';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import {SharedModule} from './shared/shared.module';

import {LabarchivesFormComponent} from './labarchives-form.component';
import {LabarchivesLoginComponent} from './components/labarchives-login.component';
import {LabarchivesListComponent} from './components/labarchives-list.component';

@NgModule({
  imports: [
    BrowserModule, ReactiveFormsModule, FormsModule, SharedModule
  ],
  declarations: [
    LabarchivesFormComponent, LabarchivesLoginComponent, LabarchivesListComponent
  ],
  exports: [],
  providers: [],
  bootstrap: [
    LabarchivesFormComponent
  ],
  entryComponents: [
    LabarchivesFormComponent, LabarchivesListComponent, LabarchivesLoginComponent
  ]
})
export class LabarchivesModule {
}
