import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp,
  IonSplitPane,
  IonMenu,
  IonContent,
  IonList,
  IonListHeader,
  IonNote,
  IonMenuToggle,
  IonItem,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonSelect
} from '@ionic/angular/standalone';
import { DayLifeTimePickerComponent } from './day-life-time-picker/day-life-time-picker.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpRequestsService } from './http-requests.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    CommonModule,
    IonApp,
    IonSplitPane,
    IonMenu,
    IonContent,
    IonList,
    IonListHeader,
    IonNote,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel,
    IonRouterOutlet,
    DayLifeTimePickerComponent,
    IonSelect,
    HttpClientModule,
  ],
  providers: [HttpRequestsService, ToastController]
})
export class AppComponent implements OnInit{
  public appPages = [
    { title: 'Factory', url: '/folder/factory', icon: 'mail' },
    { title: 'Workstations', url: '/folder/workstations', icon: 'paper-plane' }
  ];
  isMenuPage: boolean = false;
  constructor(private router: Router) {

  }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isMenuPage = event.urlAfterRedirects.endsWith('/menu');
      }
    });
  }
}
