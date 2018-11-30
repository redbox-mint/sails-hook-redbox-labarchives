import {BrowserModule} from '@angular/platform-browser';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import {SharedModule} from './shared/shared.module';

import {LabarchivesService} from "./labarchives.service";

import {LabarchivesFormComponent} from './labarchives-form.component';
import {LabarchivesLoginComponent} from './components/labarchives-login.component';
import {LabarchivesListComponent} from './components/labarchives-list.component';
import {LabarchivesLinkComponent} from "./components/labarchives-link.component";

@NgModule({
  imports: [
    BrowserModule, ReactiveFormsModule, FormsModule, SharedModule
  ],
  declarations: [
    LabarchivesFormComponent, LabarchivesLoginComponent, LabarchivesListComponent, LabarchivesLinkComponent
  ],
  exports: [],
  providers: [
    LabarchivesService
  ],
  bootstrap: [
    LabarchivesFormComponent
  ],
  entryComponents: [
    LabarchivesFormComponent, LabarchivesListComponent, LabarchivesLoginComponent, LabarchivesLinkComponent
  ]
})
export class LabarchivesModule {
}
