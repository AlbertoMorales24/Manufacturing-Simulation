import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FactorySimDataService } from '../factory-sim-data.service';
import { last } from 'rxjs';

@Component({
  selector: 'app-bar-chart-graphic',
  templateUrl: './bar-chart-graphic.component.html',
  styleUrls: ['./bar-chart-graphic.component.scss'],
  standalone: true,
  imports: [ NgxChartsModule]
})
export class BarChartGraphicComponent implements OnChanges{
  @Input() activeTimePeriod: string = ''
  @Input() timePeriod1: string = ''
  @Input() timePeriod2: string = ''
  @Input() mode: string = ''

  multi: any[] = [];
  view: any[] = [700, 400];

  // options
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  gradient: boolean = false;
  showLegend: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Workstations id';
  showYAxisLabel: boolean = true;
  yAxisLabel: string = 'Time';
  animations: boolean = true;

  colorScheme = {
    domain: ['#5AA454', '#C7B42C', '#AAAAAA']
  };

  dailyData: any

  constructor(public factorySimDataService: FactorySimDataService) {
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
    let multi: any = null
    this.dailyData = this.factorySimDataService.data
    if(this.mode === 'status'){
      console.log("data", this.factorySimDataService.data)
      multi = this.getWksValues();
    }else{
      //single = this.getFactoryValues();
    }
    console.log("1", multi)
    this.multi = multi;
    Object.assign(this, { multi });
  }

  getWksValues(){
    const values: {}[] = []
    const wksValues: {[key: string] : number}[] = []

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
      const factoryData = ((dayProduction as {"workstations": {[key: string] : {"statusTime": {"DOWN": number, "IDLE":number, "PRODUCING":number, "RESTOCK":number, "START":number}}}}).workstations)
      for(const wksId in factoryData){
        if(wksValues.length > parseInt(wksId)){
          console.log("test", wksValues[parseInt(wksId)])
          console.log("test2", factoryData[wksId]["statusTime"])
          wksValues[parseInt(wksId)]["DOWN"] += factoryData[wksId]["statusTime"]["DOWN"]
          wksValues[parseInt(wksId)]["IDLE"] += factoryData[wksId]["statusTime"]["IDLE"]
          wksValues[parseInt(wksId)]["PRODUCING"] += factoryData[wksId]["statusTime"]["PRODUCING"]
          wksValues[parseInt(wksId)]["RESTOCK"] += factoryData[wksId]["statusTime"]["RESTOCK"]
          wksValues[parseInt(wksId)]["START"] += factoryData[wksId]["statusTime"]["START"]
        }else{
          console.log("test123", factoryData[wksId]["statusTime"])
          wksValues.push({"DOWN": factoryData[wksId]["statusTime"]["DOWN"], "IDLE": factoryData[wksId]["statusTime"]["IDLE"], "PRODUCING": factoryData[wksId]["statusTime"]["PRODUCING"], "RESTOCK": factoryData[wksId]["statusTime"]["RESTOCK"], "START": factoryData[wksId]["statusTime"]["START"]})
        }
      }
    }
    if((this.compareDates(this.timePeriod2, this.factorySimDataService.dates[0]) == -1) || (this.compareDates(this.timePeriod1, this.factorySimDataService.dates[this.factorySimDataService.dates.length - 1]) == 1)){
      values.push({"name": "No Data", "series": [{"name": "No Data", "value": 1}]})
    }else{
      for(let i = 0; i < wksValues.length; i++) {
        values.push({"name": String(i), "series": [{"name": "DOWN", "value": wksValues[i]["DOWN"]}, {"name": "IDLE", "value": wksValues[i]["IDLE"]}, {"name": "PRODUCING", "value": wksValues[i]["PRODUCING"]}, {"name": "RESTOCK", "value": wksValues[i]["RESTOCK"]}, {"name": "START", "value": wksValues[i]["START"]}]})
      }
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
    //if(this.getDailyProduction()){
    if(false){
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
      let down = 0
      let idle = 0
      let producing = 0
      let restock = 0
      let start = 0
      console.log("dailyProd", dailyProd)
      console.log("ordered", orderedDays),
      console.log("dates", this.timePeriod1, this.timePeriod2)
      const daysInPeriod = []
      const wks = []
      for(const wk in dailyProd[orderedDays[0]].workstations){
        wks.push({"name": wk.toString(), "series": [{"name": "DOWN", "value": 0}, {"name": "IDLE", "value": 0}, {"name": "PRODUCING", "value": 0}, {"name": "RESTOCK", "value": 0}, {"name": "START", "value": 0}]})
      }
      for(let day in orderedDays){
        day = orderedDays[day]
        if(this.compareDates(day, this.timePeriod2) == 1) {
          console.log(1, day)
          break
        }
        console.log("length", Object.keys(dailyProd[day].workstations).length)
        for(let wk = 0;wk < Object.keys(dailyProd[day].workstations).length; wk++){
          console.log("wk", wk)
          //const wk = parseInt(wk1)
          if(this.compareDates(day, this.timePeriod1) == 0 || this.compareDates(day, this.timePeriod1) == 1) {
            console.log(-1, day)
            wks[wk].series[0].value += dailyProd[day].workstations[wk.toString()].statusTime.DOWN
            wks[wk].series[1].value += dailyProd[day].workstations[wk.toString()].statusTime.IDLE
            wks[wk].series[2].value += dailyProd[day].workstations[wk.toString()].statusTime.PRODUCING
            wks[wk].series[3].value += dailyProd[day].workstations[wk.toString()].statusTime.RESTOCK
            wks[wk].series[4].value += dailyProd[day].workstations[wk.toString()].statusTime.START
            daysInPeriod.push(day)
          }

        }
        if(this.compareDates(day, this.timePeriod2) == 0){
          console.log(0, day)
          break
        }
      }
      console.log("daysPeriod", daysInPeriod)
      return wks
    }
    return null
  }

  getGraphValues2(){

  }


  getDailyProduction() {
    //return this.factorySimDataService.getDailyProduction()
  }

  async fetchAllData() {
    try {
      //const result = await this.factorySimDataService.fetchDataById("sim", "1"); // Wait for the data to be fetched
      //this.getTotalProdcution();
    } catch (error) {
        console.error('Error fetching data:', error);
    }finally{
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

}
