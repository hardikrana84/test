import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DesktopComponent } from '../desktop/desktop.component';
import { MultiStepFormPage } from './multi-step-form.page';

const routes: Routes = [
  
  {
    path: '',
    component: MultiStepFormPage
  }
  // ,
  // {
  //   path: '',
  //   component: DesktopComponent
  // }
  // ,
  // {
  //   path: 'personal-info',
  //   component: MultiStepFormPage
  // },
  // {
  //   path: 'liquor-license',
  //   component: MultiStepFormPage
  // },
  // {
  //   path: 'owner-details',
  //   component: MultiStepFormPage
  // },
  // {
  //   path: 'financial-information',
  //   component: MultiStepFormPage
  // },
  // {
  //   path: 'identity-back',
  //   component: MultiStepFormPage
  // },
  // {
  //   path: 'drivers-front',
  //   component: MultiStepFormPage
  // },
  // {
  //   path: 'drivers-back',
  //   component: MultiStepFormPage
  // },

  // {
  //   path: 'verify-information',
  //   component: MultiStepFormPage
  // },
  // {
  //   path: 'identity-invalid',
  //   component: MultiStepFormPage
  // },
  // {
  //   path: 'poa',
  //   component: MultiStepFormPage
  // },
  // {
  //   path: 'poi',
  //   component: MultiStepFormPage
  // },
  // {
  //   path: 'verify-address',
  //   component: MultiStepFormPage
  // },
  // {
  //   path: 'final-confirmation',
  //   component: MultiStepFormPage
  // }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MultiStepFormPageRoutingModule {}
