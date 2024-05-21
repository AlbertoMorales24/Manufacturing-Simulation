import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { FactorySimDataService } from '../factory-sim-data.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-pie-chart-graphic',
  templateUrl: './pie-chart-graphic.component.html',
  styleUrls: ['./pie-chart-graphic.component.scss'],
  standalone: true,
  imports: [ NgxChartsModule]
})
export class PieChartGraphicComponent implements OnChanges{
  @Input() activeTimePeriod: string = ''
  @Input() timePeriod1: string = ''
  @Input() timePeriod2: string = ''
  @Input() mode: string = ''

  single: any[] = [];
  view: Number[] = [700, 400];

  // options
  gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = true;
  isDoughnut: boolean = false;
  legendPosition: string = 'below';

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  dailyData: any

  constructor(public factorySimDataService: FactorySimDataService){
    this.factorySimDataService.fetchRuns()
    .then(() => {
      console.log("runs fetched");
      const lastRun = this.factorySimDataService.runs[this.factorySimDataService.runs.length - 1]
      if(!this.factorySimDataService.dataFetched){
        this.factorySimDataService.fetchAllData(lastRun)
          .then(() => {
            console.log("dates fetched");
            this.drawGraph();
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
          });
      }else{
        //this.getTotalProdcution();
      }
    })
    .catch((error) => {
      console.error("Error fetching runs:", error);
    });

  }

  drawGraph(){
    let single: any = null
    this.dailyData = this.factorySimDataService.data
    if(this.mode === 'status'){
      console.log("data", this.factorySimDataService.data)
      single = this.getProductsValues();
    }else{
      single = this.getFactoryValues();
    }
    console.log("1", single)
    Object.assign(this, { single });
  }

  getProductsValues() {
    const values: {}[] = []
    let productsFinished = 0
    let productsFailed = 0
    let productsAborted = 0
    let productsOrdered = 0
    let productsIncomplete = 0
    console.log("index2.1", this.timePeriod2)
    this.timePeriod1 = this.formatDate(this.timePeriod1)
    this.timePeriod2 = this.formatDate(this.timePeriod2)
    let index1 = 0;
    let index2 = this.factorySimDataService.dates.length - 1
    if(this.factorySimDataService.dates.includes(this.timePeriod1)){
      index1 = this.factorySimDataService.dates.indexOf(this.timePeriod1);
    }
    console.log("index2", this.timePeriod2)
    console.log(this.factorySimDataService.dates)
    console.log(this.factorySimDataService.dates.includes(this.timePeriod2))
    if(this.factorySimDataService.dates.includes(this.timePeriod2)){
      index2 = this.factorySimDataService.dates.indexOf(this.timePeriod2);
    }
    console.log(index1, index2)
    for(let i = index1; i <= index2; i++){
      const dayProduction = this.factorySimDataService.data[this.factorySimDataService.dates[i]];
      //console.log(this.factorySimDataService.data)
      //console.log(this.factorySimDataService.dates[i])
      //console.log(dayProduction)
      console.log(i, this.factorySimDataService.dates.length)
      const factoryData = ((dayProduction as {"factory": {}}).factory as {"productsFinished": number, "productsFailed": number, "productsAborted": number, "productsIncomplete": number, "productsOrdered": number})
      productsFinished += factoryData["productsFinished"]
      productsFailed+= factoryData["productsFailed"]
      productsAborted+= factoryData["productsAborted"]
      if(i == index2){
        productsOrdered = factoryData["productsOrdered"]
        productsIncomplete = factoryData["productsIncomplete"]
      }
    }
    console.log(this.timePeriod2, this.factorySimDataService.dates[0])
    if((this.compareDates(this.timePeriod2, this.factorySimDataService.dates[0]) == -1) || (this.compareDates(this.timePeriod1, this.factorySimDataService.dates[this.factorySimDataService.dates.length - 1]) == 1)){
      values.push({"name": "No Data", "value": 1})
    }else{
      values.push({"name": "Finished", "value": productsFinished})
      values.push({"name": "Failed", "value": productsFailed})
      values.push({"name": "Aborted", "value": productsAborted})
      values.push({"name": "Incomplete", "value": productsIncomplete})
      values.push({"name": "Pending", "value": productsOrdered})
    }
    return values
  }

  getFactoryValues(){
    const values: {}[] = []
    let completeDays = 0
    let shutdownDays = 0

    console.log("index2.1", this.timePeriod2)
    this.timePeriod1 = this.formatDate(this.timePeriod1)
    this.timePeriod2 = this.formatDate(this.timePeriod2)
    let index1 = 0;
    let index2 = this.factorySimDataService.dates.length - 1
    if(this.factorySimDataService.dates.includes(this.timePeriod1)){
      index1 = this.factorySimDataService.dates.indexOf(this.timePeriod1);
    }
    console.log("index2", this.timePeriod2)
    console.log(this.factorySimDataService.dates)
    console.log(this.factorySimDataService.dates.includes(this.timePeriod2))
    if(this.factorySimDataService.dates.includes(this.timePeriod2)){
      index2 = this.factorySimDataService.dates.indexOf(this.timePeriod2);
    }
    console.log(index1, index2)
    for(let i = index1; i <= index2; i++){
      const dayProduction = this.factorySimDataService.data[this.factorySimDataService.dates[i]];
      //console.log(this.factorySimDataService.data)
      //console.log(this.factorySimDataService.dates[i])
      //console.log(dayProduction)
      console.log(i, this.factorySimDataService.dates.length)
      const factoryData = ((dayProduction as {"factory": {}}).factory as {"shutdown": boolean})
      if(factoryData["shutdown"]){
        shutdownDays += 1
      }else{
        completeDays += 1
      }
    }
    console.log(this.timePeriod2, this.factorySimDataService.dates[0])
    if((this.compareDates(this.timePeriod2, this.factorySimDataService.dates[0]) == -1) || (this.compareDates(this.timePeriod1, this.factorySimDataService.dates[this.factorySimDataService.dates.length - 1]) == 1)){
      values.push({"name": "No Data", "value": 1})
    }else{
      values.push({"name": "Working Days", "value": completeDays})
      values.push({"name": "Shutdowns", "value": shutdownDays})
    }
    return values
  }

  formatDate(date: string) {
    if(date.includes("T")){
      date = date.split("T")[0];
    }
    const year = date.split("-")[0]
    const month = date.split("-")[1]
    const day = date.split("-")[2]

    const newDate = day + "-" + month + "-" + year

    return newDate
  }

  getGraphValues(){
    const values = []
    const dayValues = []
    //const totalProd: any = this.getTotalProdcution()
    //const totalFactoryProd = totalProd.factory
    const dailyProd: any = this.getDailyProduction()
    const days = []
    for(const day in dailyProd){
      days.push(day)
    }
    const orderedDays = this.sortByDate(days.slice())
    let inOrder = 0
    let incomplete = 0
    let done = 0
    let failed = 0
    let aborted = 0
    console.log("dailyProd", dailyProd)
    console.log("ordered", orderedDays),
    console.log("dates", this.timePeriod1, this.timePeriod2)
    const daysInPeriod = []
    for(let day in orderedDays){
      day = orderedDays[day]
      if(this.compareDates(day, this.timePeriod2) == 1) {
        console.log(1, day)
        break
      }
      if(this.compareDates(day, this.timePeriod1) == 0 || this.compareDates(day, this.timePeriod1) == 1) {
        console.log(-1, day)
        done += dailyProd[day].factory.productsFinished
        failed += dailyProd[day].factory.productsFailed
        aborted += dailyProd[day].factory.productsAborted
        daysInPeriod.push(day)
      }
      if(this.compareDates(day, this.timePeriod2) == 0){
        console.log(0, day)
        inOrder = dailyProd[day].factory.productsOrdered
        incomplete = dailyProd[day].factory.productsIncomplete
        break
      }
    }
    console.log("daysPeriod", daysInPeriod)
    dayValues.push({"name": "InOrder","value": inOrder})
    dayValues.push({"name": "Incomplete","value": incomplete})
    dayValues.push({"name": "Done","value": done})
    dayValues.push({"name": "Failed","value": failed})
    dayValues.push({"name": "Aborted","value": aborted})

    /*console.log(totalFactoryProd["productsPlanned"])
    values.push({"In Order": totalFactoryProd["productsPlanned"]})
    values.push({"Incomplete": totalFactoryProd["productsIncomplete"]})
    values.push({"Done": totalFactoryProd["productsFinished"]})
    values.push({"Failed": totalFactoryProd["productsFailed"]})
    values.push({"Aborted": totalFactoryProd["productsAborted"]})*/
    return dayValues
  }

  getGraphValues2(){
    const values = []
    const dayValues = []
    //const totalProd: any = this.getTotalProdcution()
    //const totalFactoryProd = totalProd.factory
    const dailyProd: any = this.getDailyProduction()
    const days = []
    for(const day in dailyProd){
      days.push(day)
    }
    const orderedDays = this.sortByDate(days.slice())
    let shutdowns = 0
    console.log("dailyProd", dailyProd)
    console.log("ordered", orderedDays),
    console.log("dates", this.timePeriod1, this.timePeriod2)
    const daysInPeriod = []
    for(let day in orderedDays){
      day = orderedDays[day]
      if(this.compareDates(day, this.timePeriod2) == 1) {
        console.log(1, day)
        break
      }
      if(this.compareDates(day, this.timePeriod1) == 0 || this.compareDates(day, this.timePeriod1) == 1) {
        console.log(-1, day)
        shutdowns += (dailyProd[day].factory.shutdown ? 1 : 0)
        daysInPeriod.push(day)
      }
      if(this.compareDates(day, this.timePeriod2) == 0){
        console.log(0, day)
        break
      }
    }
    console.log("daysPeriod", daysInPeriod)
    dayValues.push({"name": "Active Days","value": daysInPeriod.length - shutdowns})
    dayValues.push({"name": "Shutdowns","value": shutdowns})

    /*console.log(totalFactoryProd["productsPlanned"])
    values.push({"In Order": totalFactoryProd["productsPlanned"]})
    values.push({"Incomplete": totalFactoryProd["productsIncomplete"]})
    values.push({"Done": totalFactoryProd["productsFinished"]})
    values.push({"Failed": totalFactoryProd["productsFailed"]})
    values.push({"Aborted": totalFactoryProd["productsAborted"]})*/
    return dayValues
  }

  parseDate(dateString: string) {
    const parts = dateString.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are zero-indexed (January is 0)
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  async fetchAllData() {
    try {
      //const result = await this.factorySimDataService.fetchDataById("sim", "1"); // Wait for the data to be fetched
      //this.getTotalProdcution();
      this.drawGraph()
    } catch (error) {
        console.error('Error fetching data:', error);
    }
  }

  getTotalProdcution(){
    //return this.factorySimDataService.getTotalProduction()
  }

  getDailyProduction() {
    //return this.factorySimDataService.getDailyProduction()
  }

  ngOnChanges(changes: import('@angular/core').SimpleChanges) {
    if(this.factorySimDataService.dataFetched){
      if (changes['timePeriod1']) {
      }
      if (changes['timePeriod2']) {
      }
      if (changes['activeTimePeriod']) {
      }
      this.drawGraph()
    }
  }

  sortByDate(dates: string[]): string[] {
    return dates.sort((date1, date2) => {
      // Split the date strings into components
      const parts1 = date1.split('/');
      const parts2 = date2.split('/');

      // Convert components to numbers for comparison
      const day1 = parseInt(parts1[0], 10);
      const month1 = parseInt(parts1[1], 10) - 1; // Months are zero-indexed in JavaScript
      const year1 = parseInt(parts2[2], 10);

      const day2 = parseInt(parts2[0], 10);
      const month2 = parseInt(parts2[1], 10) - 1;
      const year2 = parseInt(parts2[2], 10);

      // Compare dates chronologically (year, month, day)
      if (year1 < year2) return -1; // date1 is earlier
      if (year1 > year2) return 1; // date2 is earlier

      if (month1 < month2) return -1;
      if (month1 > month2) return 1;

      if (day1 < day2) return -1;
      if (day1 > day2) return 1;

      return 0; // Dates are equal
    });
  }

  compareDates(dateString1: string, dateString2: string): number {
    try {
      if(dateString1.includes("T")){
        dateString1 = dateString1.split('T')[0]
      }
      if(dateString2.includes("T")){
        dateString2 = dateString2.split('T')[0]
      }
      // Parse the date strings
      const parts1 = dateString1.split("-");
      const parts2 = dateString2.split("-");
      const date1 = new Date(parseInt(parts1[2], 10), parseInt(parts1[1], 10) - 1, parseInt(parts1[0], 10));
      const date2 = new Date(parseInt(parts2[2], 10), parseInt(parts2[1], 10) - 1, parseInt(parts2[0], 10));

      // Compare the dates
      if (date1 < date2) {
        return -1;
      } else if (date1 > date2) {
        return 1;
      } else {
        return 0;
      }
    } catch (error: any) {
      console.error("Error parsing date strings:", error.message);
      return NaN; // Return NaN on error
    }
  }

  compareDate(date1: string, date2: string): number {
    // Split the date strings into components
    const parts1 = date1.split('/');
    const parts2 = date2.split('/');

    // Convert components to numbers for comparison
    const day1 = parseInt(parts1[0], 10);
    const month1 = parseInt(parts1[1], 10) - 1; // Months are zero-indexed in JavaScript
    const year1 = parseInt(parts1[2], 10);

    const day2 = parseInt(parts2[0], 10);
    const month2 = parseInt(parts2[1], 10) - 1;
    const year2 = parseInt(parts2[2], 10);

    // Compare dates chronologically (year, month, day)
    if (year1 < year2) return -1; // date1 is earlier
    if (year1 > year2) return 1; // date2 is earlier

    if (month1 < month2) return -1;
    if (month1 > month2) return 1;

    if (day1 < day2) return -1;
    if (day1 > day2) return 1;

    return 0; // Dates are equal
  }

}
