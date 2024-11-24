import {Routes} from "@angular/router";
import {PopupComponent} from "./popup/popup.component";

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: PopupComponent
  }
]
