import {Component} from '@angular/core';
import {PopupComponent} from '../../popup/popup/popup.component';

@Component({
  selector: 'app-options',
  imports: [
    PopupComponent
  ],
  templateUrl: './options.component.html',
  standalone: true,
  styleUrl: './options.component.scss'
})
export class OptionsComponent {

}
