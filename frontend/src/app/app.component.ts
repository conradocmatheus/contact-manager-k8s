import { Component } from '@angular/core';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import {RouterOutlet} from '@angular/router';
import {NgToastModule} from 'ng-angular-popup';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgToastModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {}
