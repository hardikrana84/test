import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { Storage } from '@ionic/storage-angular';

const routes: Routes = [
  // {
  //   path: 'desktop',
  //   loadChildren: () => import('./desktop/desktop.module').then( m => m.DesktopModule)
  // },
  {
    path: ':pathname',
    loadChildren: () => import('./multi-step-form/multi-step-form.module').then( m => m.MultiStepFormPageModule)
  },
  {
    path: '',
    redirectTo: 'entity-information',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule],
  providers: [Storage]
})
export class AppRoutingModule { }
