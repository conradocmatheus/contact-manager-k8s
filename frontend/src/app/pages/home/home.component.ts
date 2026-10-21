import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private titleService: Title) {

    this.titleService.setTitle("Home");
  }
}
