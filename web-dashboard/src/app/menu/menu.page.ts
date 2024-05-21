import { FactorySimDataService } from './../factory-sim-data.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonProgressBar, IonToast } from '@ionic/angular/standalone';
import { HttpRequestsService } from '../http-requests.service';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';

type FormProperties = 'daysToRun' | 'closeRate' | 'rejectRate' | 'maxRawBin' | 'restockUnits' | 'fixTime' | 'workTime' | 'workstationsNumber';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  standalone: true,
  imports: [IonToast, IonProgressBar, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonItem, IonLabel, HttpClientModule, IonProgressBar, IonToast]
})
export class MenuPage implements OnInit {

  daysToRun: number = 1;
  closeRate: number = 0.01;
  rejectRate: number = 0.05;
  maxRawBin: number = 25;
  restockUnits: number = 3;
  restockTime: number = 2;
  fixTime: number = 3;
  workTime: number = 4;
  workstationsNumber: number = 6;
  workstationsRates: number[] = [0.2,0.1,0.15,0.05,0.07,0.1];

  simRunning: boolean = false;

  constructor(private httpService: HttpRequestsService, private router: Router, private loadingController: LoadingController, private toastController: ToastController, private factorySimDataService: FactorySimDataService) { }

  ngOnInit() {
    1==1
  }

  onInputChange(property: string, value: any) {
    console.log(`Updated ${property} to ${value}`);
    if(!value || parseFloat(value) < 0){
      value = 1
    }
    if(property === "daysToRun"){
      this.daysToRun = value
    }else if(property === "closeRate"){
      this.closeRate = value
    }else if(property === "rejectRate"){
      this.rejectRate = value
    }else if(property === "maxRawBin"){
      this.maxRawBin = value
    }else if(property === "restockUnits"){
      this.restockUnits = value
    }else if(property === "restockTime"){
      this.restockTime = value
    }else if(property === "fixTime"){
      this.fixTime = value
    }else if(property === "workTime"){
      this.workTime = value
    }else if(property === "workstationsNumber"){
      this.workstationsNumber = value
      for(let i = 0; i < this.workstationsNumber; i++) {
        if(!this.workstationsRates[i]){
          this.workstationsRates[i] = 0
        }
      }
    }else{
      this.workstationsRates[parseInt(property)] = value
      console.log(this.workstationsRates)
    }
  }

  runSim(){
    this.matchMinMax("daysToRun", this.daysToRun, 1, 1000);
    this.matchMinMax("closeRate", this.closeRate, 0, 1);
    this.matchMinMax("rejectRate", this.rejectRate, 0, 1);
    this.matchMinMax("maxRawBin", this.maxRawBin, 1, 500);
    this.matchMinMax("restockUnits", this.restockUnits, 1, 100);
    this.matchMinMax("restockTime", this.restockTime, 1, 100);
    this.matchMinMax("fixTime", this.fixTime, 1, 100);
    this.matchMinMax("workTime", this.workTime, 1, 100);
    this.matchMinMax("workstationsNumber", this.workstationsNumber, 1, 100);
    for(let i = 0; i < this.workstationsNumber; i++){
      this.matchMinMax("i", this.workstationsRates[i], 0, 1)
    }
    this.workstationsRates.splice(this.workstationsNumber)
    console.log(this.workstationsRates)
    console.log("click")
    const requestBody = {
      "daysToRun": this.daysToRun,
      "closeRate": this.closeRate,
      "rejectRate": this.rejectRate,
      "maxRawBin": this.maxRawBin,
      "restockUnits": this.restockUnits,
      "restockTime": this.restockTime,
      "fixTime": this.fixTime,
      "workTime": this.workTime,
      "workstationsNumber": this.workstationsNumber,
      "workstationsRates": this.workstationsRates
    }
    this.runSimRequest(requestBody);
  }

  matchMinMax(variable: string, num: number, min: number, max: number){
    let value: number
    if(num < min || !num) {
      value = min
    }else if(num > max){
      value = max
    }else {
      value = num
    }
    if(variable === "daysToRun"){
      this.daysToRun = value
    }else if(variable == "closeRate"){
      this.closeRate = value
    }else if(variable == "rejectRate"){
      this.rejectRate = value
    }else if(variable == "maxRawBin"){
      this.maxRawBin = value
    }else if(variable == "restockUnits"){
      this.restockUnits = value
    }else if(variable == "restockTime"){
      this.restockTime = value
    }else if(variable == "fixTime"){
      this.fixTime = value
    }else if(variable == "workTime"){
      this.workTime = value
    }else if(variable == "workstationsNumber"){
      this.workstationsNumber = value
    }else{
      const index = parseInt(variable)
      this.workstationsRates[index] = value
    }
  }

  getNumberArray() {
    return Array(this.workstationsNumber).fill(0).map((_, i) => i);
  }

  runSimRequest(requestBody: {}) {
    this.simRunning = true;
    this.showLoading("Simulating...")
    const url = 'https://albertomv.pythonanywhere.com/run-script';

    this.httpService.runSim(url, requestBody).subscribe(
      response => {
        console.log('Response:', response);
        this.factorySimDataService.fetchRuns();
        this.simRunning = false;
        this.hideLoading();
        this.factorySimDataService.fetchRuns()
          .then(() => {
            this.router.navigate(['/folder/factory']);
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
        });

      },
      error => {
        console.log("errror in request")
        console.error('Error:', error);
        this.simRunning = false;
        this.presentToast()
        this.hideLoading();
      }
    );
  }

  async showLoading(message: string) {
    const loading = await this.loadingController.create({
      message: message,
      translucent: true,
      cssClass: 'custom-loading'
    });
    await loading.present();
  }

  async hideLoading() {
    await this.loadingController.dismiss();
  }


  async presentToast() {
    console.log("Toast");
    try {
      const toast = await this.toastController.create({
        message: 'Error during Simulation',
        duration: 3000,
        position: 'middle',
        icon: 'bug-outline'
      });

      await toast.present();
    } catch (error) {
      console.error('Error displaying toast:', error);
    }
  }

}
