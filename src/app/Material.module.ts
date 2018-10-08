import {MatButtonModule, MatCheckboxModule} from '@angular/material';
import {NgModule} from '@angular/core';

const Ng_Modules = [
  MatButtonModule,
  MatCheckboxModule
];

@NgModule({
  imports: [ ...Ng_Modules ],
  exports: [ ...Ng_Modules ],
})
export class MaterialModule { }
