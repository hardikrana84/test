import { Component } from '@angular/core';
import { GlobalConstants } from 'src/common/globalconstants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(public router:Router) {
   
   
  }
}
