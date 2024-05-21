import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonIcon, IonButton, IonDatetimeButton, IonModal, IonDatetime, IonRadio, IonRadioGroup, IonList, IonItem, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DayLifeTimePickerComponent } from '../day-life-time-picker/day-life-time-picker.component';
import { NgIf } from '@angular/common';
import { PieChartGraphicComponent } from '../pie-chart-graphic/pie-chart-graphic.component';
import { FactorySimDataService } from '../factory-sim-data.service';
import { BarChartGraphicComponent } from '../bar-chart-graphic/bar-chart-graphic.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
  standalone: true,
  imports: [IonItem, IonList, IonButton, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, DayLifeTimePickerComponent, BarChartGraphicComponent, PieChartGraphicComponent, IonIcon, IonDatetimeButton, IonModal, IonDatetime, NgIf, IonRadio, IonRadioGroup, IonSelect, IonSelectOption, FormsModule],
})
export class FolderPage implements OnInit {
  public folder!: string;
  private activatedRoute = inject(ActivatedRoute);
  timePeriod: string = 'day'
  periodDate1: string = new Date().toISOString().split("T")[0]
  periodDate2: string = new Date().toISOString().split("T")[0]
  minDate: string = new Date().toISOString().split("T")[0];
  maxDate: string = new Date().toISOString().split("T")[0];
  todayDate: Date = new Date()
  today: string = this.getTodayDate();
  dailyData: any = {}
  selectedDates = {
    'day': (this.minDate),
    'week': {day1: (this.minDate), day2: this.addDaysToDateString(this.minDate, 6)},
    'month': {"month": (this.minDate).split("-")[1], "year": (this.minDate).split("-")[0]},
    'quarter': {"q": this.getQuarter((this.minDate)), "year": (this.minDate).split("-")[0]},
    'year': (this.minDate).split("-")[0],
    'all': {day1: (this.minDate), day2: (this.maxDate)},
    'custom': {day1: (this.minDate), day2: this.addDaysToDateString((this.minDate), 1)}
  }
  selectedDay: string = this.formatDate(this.today)
  activePage: string = ''

  runs: string[] = []

  activerun: string = ''
  constructor(private factorySimDataService: FactorySimDataService, private router: Router) {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;
    this.activePage = this.folder
    console.log("runs service", this.factorySimDataService.runs)
    this.runs = this.factorySimDataService.runs
    this.activerun = this.factorySimDataService.runs[this.factorySimDataService.runs.length - 1]
  }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;
    this.activePage = this.folder
    console.log("runs service 2", this.factorySimDataService.runs)
    this.factorySimDataService.fetchRuns()
      .then(() => {
        const lastRun = this.factorySimDataService.runs[this.factorySimDataService.runs.length - 1]
        //this.runs = this.factorySimDataService.runs
        console.log("all runs", this.runs)
        //this.activerun = lastRun;
        if(!this.factorySimDataService.dataFetched) {
          this.factorySimDataService.fetchAllData(lastRun)
            .then(() => {
              console.log("dates fetched");
              this.dailyData = this.factorySimDataService.data;
              this.minDate = this.formatDateForIonDatetime(this.factorySimDataService.dates[0]);
              this.maxDate = this.formatDateForIonDatetime(this.factorySimDataService.dates[this.factorySimDataService.dates.length - 1]);
              console.log(this.minDate, this.maxDate);
              this.selectedDates = {
                'day': (this.minDate),
                'week': {day1: (this.minDate), day2: this.addDaysToDateString(this.minDate, 6)},
                'month': {"month": (this.minDate).split("-")[1], "year": (this.minDate).split("-")[0]},
                'quarter': {"q": this.getQuarter((this.minDate)), "year": (this.minDate).split("-")[0]},
                'year': (this.minDate).split("-")[0],
                'all': {day1: (this.minDate), day2: (this.maxDate)},
                'custom': {day1: (this.minDate), day2: this.addDaysToDateString((this.minDate), 1)}
              }

            })
            .catch((error) => {
              console.error("Error fetching data:", error);
            });
        }else {
          this.dailyData = this.factorySimDataService.data;
          this.minDate = this.formatDateForIonDatetime(this.factorySimDataService.dates[0]);
          this.maxDate = this.formatDateForIonDatetime(this.factorySimDataService.dates[this.factorySimDataService.dates.length - 1]);
          console.log(this.minDate, this.maxDate);
          this.selectedDates = {
            'day': (this.minDate),
            'week': {day1: (this.minDate), day2: this.addDaysToDateString(this.minDate, 6)},
            'month': {"month": (this.minDate).split("-")[1], "year": (this.minDate).split("-")[0]},
            'quarter': {"q": this.getQuarter((this.minDate)), "year": (this.minDate).split("-")[0]},
            'year': (this.minDate).split("-")[0],
            'all': {day1: (this.minDate), day2: (this.maxDate)},
            'custom': {day1: (this.minDate), day2: this.addDaysToDateString((this.minDate), 1)}
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching runs:", error);
      });

  }

  onOptionChange(event: any) {
    const selectedRoute = event.detail.value;
    this.router.navigate([selectedRoute]);
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;
  }

  onRunChange(event: any) {
    const selectedRun = event.detail.value;
    this.activerun = selectedRun;
  }

  getDaysDate(days: any) {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000 * days);
    const formattedDate = tomorrow.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return formattedDate;
  }

  addDaysToDateString(dateString: string, daysToAdd: number): string {
    try {
      // Parse the date string
      const parts = dateString.split("-");
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Months are zero-indexed in JavaScript
      const day = parseInt(parts[2], 10);

      // Create a Date object
      const date = new Date(year, month, day);

      // Add the specified number of days
      date.setDate(date.getDate() + daysToAdd);

      // Get year, month, and day for the new date
      const newYear = date.getFullYear();
      const newMonth = String(date.getMonth() + 1).padStart(2, '0'); // Pad month with leading zero if needed
      const newDay = String(date.getDate()).padStart(2, '0'); // Pad day with leading zero if needed

      // Return the formatted date string
      return `${newYear}-${newMonth}-${newDay}`;
    } catch (error: any) {
      console.error("Error adding days to date string:", error.message);
      return dateString; // Return original string on error
    }
  }

  getCustomDaysDate(date: Date, days: any) {
    const today = date;
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000 * days);
    const formattedDate = tomorrow.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return formattedDate;
  }

  getCustomMinusDaysDate(date: Date, days: any) {
    const today = date;
    const tomorrow = new Date(today.getTime() - 24 * 60 * 60 * 1000 * days);
    const formattedDate = tomorrow.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return formattedDate;
  }

  onDayChange(event: any) {
    let dateString: string = (event.detail.value)
    console.log("datestring", dateString)
    if(dateString.includes("T")){
      dateString = dateString.split('T')[0]
    }
    this.selectedDates["day"] = dateString;
    this.periodDate1 = this.selectedDates["day"]
    this.periodDate2 = this.selectedDates["day"]
  }

  onWeek1Change(event: any) {
    let dateString: string = event.detail.value

    if(dateString.includes("T")){
      dateString = dateString.split('T')[0]
    }

    this.selectedDates['week'].day2 = this.addDaysToDateString(dateString, 6);

    this.periodDate1 = this.selectedDates['week'].day1
    this.periodDate2 = this.selectedDates['week'].day2

  }

  onWeek2Change(event: any) {
    let dateString: string = event.detail.value;

    if(dateString.includes("T")){
      dateString = dateString.split('T')[0]
    }

    this.selectedDates['week'].day1 = this.addDaysToDateString(dateString, -6);

    this.periodDate1 = this.selectedDates['week'].day1
    this.periodDate2 = this.selectedDates['week'].day2
  }

  onMonthChange(event: any) {
    let dateString: string = (event.detail.value)
    console.log("datestring", dateString)
    if(dateString.includes("T")){
      dateString = dateString.split('T')[0]
    }
    this.selectedDates['month'].month = dateString.split("-")[1];
    this.selectedDates['month'].year = dateString.split("-")[0];

    this.periodDate1 = this.selectedDates['month'].year + '-' + this.selectedDates['month'].month + '-' + "01"
    this.periodDate2 = this.selectedDates['month'].year + '-' + this.getNextMonthNumber(this.selectedDates['month'].month) + '-' + "01"
    console.log("period dates month", this.periodDate1, this.periodDate2)
  }

  onQuarterNumChange(event: any) {
    const q1 = event.detail.value
    console.log("q",q1)
    this.selectedDates['quarter'].q = parseInt(q1[1]);

    const q = this.selectedDates['quarter'].q
    if(q === 1){
      this.periodDate1 = this.selectedDates['quarter'].year+"-01-01"
      this.periodDate2 = this.selectedDates['quarter'].year+"-03-31"
    }else if(q == 2){
      this.periodDate1 = this.selectedDates['quarter'].year+"-04-01"
      this.periodDate2 = this.selectedDates['quarter'].year+"-06-30"
    }else if(q == 3){
      this.periodDate1 = this.selectedDates['quarter'].year+"-07-01"
      this.periodDate2 = this.selectedDates['quarter'].year+"-09-30"
    }else if(q == 4){
      this.periodDate1 = this.selectedDates['quarter'].year+"-10-01"
      this.periodDate2 = this.selectedDates['quarter'].year+"-12-31"
    }
  }

  onQuarterYearChange(event: any) {
    let dateString: string = (event.detail.value)
    console.log("datestring", dateString)
    if(dateString.includes("T")){
      dateString = dateString.split('T')[0]
    }
    const formattedDate = dateString.split("-")[2] + '/' + dateString.split("-")[1] + '/' + dateString.split("-")[0]
    this.selectedDates['quarter'].year = formattedDate.split("/")[2];

    const q = this.selectedDates['quarter'].q
    if(q === 1){
      this.periodDate1 = this.selectedDates['quarter'].year+"-01-01"
      this.periodDate2 = this.selectedDates['quarter'].year+"-03-31"
    }else if(q == 2){
      this.periodDate1 = this.selectedDates['quarter'].year+"-04-01"
      this.periodDate2 = this.selectedDates['quarter'].year+"-06-30"
    }else if(q == 3){
      this.periodDate1 = this.selectedDates['quarter'].year+"-07-01"
      this.periodDate2 = this.selectedDates['quarter'].year+"-09-30"
    }else if(q == 4){
      this.periodDate1 = this.selectedDates['quarter'].year+"-10-01"
      this.periodDate2 = this.selectedDates['quarter'].year+"-12-31"
    }
  }

  onYearChange(event: any) {
    let dateString: string = (event.detail.value)
    console.log("year", dateString)
    if(dateString.includes("T")){
      dateString = dateString.split('T')[0]
    }
    this.selectedDates['year'] = dateString.split("-")[0];

    this.periodDate1 = this.selectedDates['year'] + '-01-01'
    this.periodDate2 = this.selectedDates['year'] + '-12-31'
    console.log("period dates year", this.periodDate1, this.periodDate2)
  }

  onCustomDate1Change(event: any) {
    let dateString: string = (event.detail.value)
    console.log("custom1", dateString)
    if(dateString.includes("T")){
      dateString = dateString.split('T')[0]
    }
    this.selectedDates["custom"].day1 = dateString;
    if(this.compareDates(this.selectedDates["custom"].day1, this.selectedDates["custom"].day2) == 1) {
      this.selectedDates["custom"].day2 = this.selectedDates["custom"].day1
    }

    this.periodDate1 = this.selectedDates["custom"].day1
    this.periodDate2 = this.selectedDates["custom"].day2

  }

  onCustomDate2Change(event: any) {
    let dateString: string = (event.detail.value)
    console.log("custom2", dateString)
    if(dateString.includes("T")){
      dateString = dateString.split('T')[0]
    }
    this.selectedDates["custom"].day2 = dateString;

    this.periodDate1 = this.selectedDates["custom"].day1
    this.periodDate2 = this.selectedDates["custom"].day2
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
      const date1 = new Date(parseInt(parts1[0], 10), parseInt(parts1[1], 10) - 1, parseInt(parts1[2], 10));
      const date2 = new Date(parseInt(parts2[0], 10), parseInt(parts2[1], 10) - 1, parseInt(parts2[2], 10));

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

  compareDate(date1: string, date2: string) {
    let [day, month, year] = date1.split("/");
    let monthIndex = parseInt(month) - 1;
    const d1 = new Date(parseInt(year), monthIndex, parseInt(day));

    [day, month, year] = date2.split("/");
    monthIndex = parseInt(month) - 1;
    const d2 = new Date(parseInt(year), monthIndex, parseInt(day));

    return d1 >= d2
  }

  formatDateForIonDatetime(dateString: string): string {
    try {
      // Split the date string into components (day, month, year)
      const parts = dateString.split("-");
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);

      // Create a Date object and check for validity
      const date = new Date(year, month - 1, day); // Months are zero-indexed in JavaScript
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date string format.");
      }

      // Return the date in ISO 8601 format (YYYY-MM-DD)
      return date.toISOString().split('T')[0];
    } catch (error: any) {
      console.error("Error formatting date string:", error.message);
      return ""; // Return empty string on error
    }
  }

  formatDate(dateString: string) {
    const date = new Date(dateString);

    // Format the date using the toLocaleDateString() method
    const formattedDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return formattedDate;
  }

  transformToDate(date: string){
    const splitDate = date.split("/");
    const day = splitDate[0];
    const month = splitDate[1];
    const year = splitDate[2];
    const formattedDate = year + "-" + month + "-" + day + "T00:00:00";
    return new Date(formattedDate)
  }

  getTodayDate(){
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Add leading zero for single-digit months
    const day = String(today.getDate()).padStart(2, '0'); // Add leading zero for single-digit days

    const formattedDate = `${year}-${month}-${day}T00:00:00`;

    return formattedDate
  }

  getNextMonthNumber(monthString: string) {
    const monthNumber = parseInt(monthString, 10);
    const nextMonth = String((monthNumber % 12) + 1).padStart(2, '0');
    return nextMonth;
  }

  onTimePeriodChange(timePeriod: string) {
    this.timePeriod = timePeriod;
    if(this.timePeriod === 'day'){
      this.periodDate1 = this.selectedDates["day"]
      this.periodDate2 = this.selectedDates["day"]
    }else if(this.timePeriod === 'week'){
      this.periodDate1 = this.selectedDates["week"].day1
      this.periodDate2 = this.selectedDates["week"].day2
    }else if(this.timePeriod === 'month'){
      this.periodDate1 = this.selectedDates['month'].year + '-' + this.selectedDates['month'].month + '-' + "01"
      this.periodDate2 = this.selectedDates['month'].year + '-' + this.getNextMonthNumber(this.selectedDates['month'].month) + '-' + "01"
    }else if(this.timePeriod === 'quarter'){
      const q = this.selectedDates['quarter'].q
      if(q === 1){
        this.periodDate1 = this.selectedDates['quarter'].year+"-01-01"
        this.periodDate2 = this.selectedDates['quarter'].year+"-03-31"
      }else if(q == 2){
        this.periodDate1 = this.selectedDates['quarter'].year+"-04-01"
        this.periodDate2 = this.selectedDates['quarter'].year+"-06-30"
      }else if(q == 3){
        this.periodDate1 = this.selectedDates['quarter'].year+"-07-01"
        this.periodDate2 = this.selectedDates['quarter'].year+"-09-30"
      }else if(q == 4){
        this.periodDate1 = this.selectedDates['quarter'].year+"-10-01"
        this.periodDate2 = this.selectedDates['quarter'].year+"-12-31"
      }
    }else if(this.timePeriod === 'year'){
      this.periodDate1 = this.selectedDates['year'] + '-01-01'
      this.periodDate2 = this.selectedDates['year'] + '-12-31'
    }else if(this.timePeriod === 'all'){
      this.periodDate1 = this.selectedDates["all"].day1
      this.periodDate2 = this.selectedDates["all"].day2
    }else if(this.timePeriod === 'custom'){
      this.periodDate1 = this.selectedDates["custom"].day1
      this.periodDate2 = this.selectedDates["custom"].day2
    }
    console.log('Data from child:', this.timePeriod);
  }

  getQuarter(date: string){
    const dateSplit: string[] = date.split("-")
    const month = dateSplit[1]
    if(month == '01' || month == '02' || month == '03'){
      return 1
    }
    if(month == '04' || month == '05' || month == '06'){
      return 2
    }
    if(month == '07' || month == '08' || month == '09'){
      return 3
    }
    else{
      return 4
    }
  }

  getActiveRun() {
    return this.activerun;
  }

  getIso8601Day() {
    return (this.selectedDates["day"])
  }

  getIso8601Week() {
    return [(this.selectedDates["week"].day1), (this.selectedDates["week"].day2)]
  }

  getIso8601Week1Max() {
    const date = (this.addDaysToDateString(this.maxDate, -6))
    return (date)
  }

  getIso8601Week2Min() {
    const date = (this.addDaysToDateString(this.minDate, 6))
    return (date)
  }

  getIso8601Month() {
    const day = this.minDate.split("-")[2]
    const date = this.selectedDates["month"].year + "-" + this.selectedDates["month"].month + "-" + day;
    return (date)
  }

  getQuarterNum() {
    return "q" + this.selectedDates["quarter"].q
  }

  getIso8601QuarterYear() {
    const year = this.selectedDates["quarter"].year
    const date = this.selectedDates["quarter"].year + "-" + this.minDate.split("-")[1] + "-" + this.minDate.split("-")[2];
    return (date)
  }

  getIso8601Year() {
    const year = this.selectedDates["year"]
    const date = this.selectedDates["year"] + "-" + this.minDate.split("-")[1] + "-" + this.minDate.split("-")[2];
    return (date)
  }

  getIso8601AllDate() {
    return [this.selectedDates["all"].day1, this.selectedDates["all"].day2];
  }

  getIso8601CustomDate() {
    return [(this.selectedDates["custom"].day1), (this.selectedDates["custom"].day2)]
  }

  transformToIso8601(dateString: string) {

    try {
      // Split the date string into day, month, and year components
      const [day, month, year] = dateString.split("/");

      // Check if all components are integers
      if (!day.match(/^\d+$/) || !month.match(/^\d+$/) || !year.match(/^\d+$/)) {
        return null;
      }

      // Convert components to integers
      const parsedDay = parseInt(day, 10);
      const parsedMonth = parseInt(month, 10) - 1; // Months are zero-indexed in JavaScript
      const parsedYear = parseInt(year, 10);

      // Validate date components
      if (parsedDay < 1 || parsedDay > 31 || parsedMonth < 0 || parsedMonth > 11 || parsedYear < 1) {
        return null;
      }

      // Format the date in ISO 8601 format using template literals
      return `${parsedYear.toString().padStart(4, "0")}-${(parsedMonth + 1).toString().padStart(2, "0")}-${parsedDay.toString().padStart(2, "0")}`;
    } catch (error) {
      console.error("Error parsing date string:", error);
      return null;
    }
  }

  /*async fetchAllData() {
    try {
      const result = await this.factorySimDataService.fetchDataById("sim", "1"); // Wait for the data to be fetched
      this.dailyData = this.factorySimDataService.getDailyProduction();
      this.minDate = this.getMinDate();
      this.maxDate = this.getMaxDate();
      this.selectedDates = {
        'day': this.formatDate(this.minDate),
        'week': {day1: this.formatDate(this.minDate), day2: this.getCustomDaysDate(new Date(this.minDate), 6)},
        'month': {"month": this.formatDate(this.minDate).split("/")[1], "year":this.formatDate(this.minDate).split("/")[2]},
        'quarter': {"q": this.getQuarter(this.formatDate(this.minDate)), "year":this.formatDate(this.minDate).split("/")[2]},
        'year': this.formatDate(this.minDate).split("/")[2],
        'all': {day1: this.formatDate(this.minDate), day2: this.formatDate(this.maxDate)},
        'custom': {day1: this.formatDate(this.minDate), day2: this.getCustomDaysDate(new Date(this.minDate), 1)}
      }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
  }*/

  getMinDate(){
    let allDates = []
    for(const day in this.dailyData){
      const date = day.split("/")[2] + "/" + day.split("/")[1] + "/" +  day.split("/")[0]
      allDates.push(new Date(date));
    }
    let mnDate = allDates.reduce(function (a, b) {
        return a < b ? a : b;
    });
    return this.formatMinMaxDate(mnDate.toDateString());
  }

  getMaxDate(){
    let allDates = []
    for(const day in this.dailyData){
      const date = day.split("/")[2] + "/" + day.split("/")[1] + "/" +  day.split("/")[0]
      allDates.push(new Date(date));
    }

    let mxDate = allDates.reduce(function (a, b) {
      return a > b ? a : b;
    });
    return this.formatMinMaxDate(mxDate.toDateString());
  }

  formatMinMaxDate(dateString: string) {
    const months = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12"
    };

    const parts = dateString.split(" ");
    const day = parts[2];
    const someMonth = parts[1]; // Guaranteed to be a valid key
    const month = months[someMonth as keyof typeof months];
    const year = parts[3];

    return `${year}-${month}-${day.padStart(2, "0")}T00:00:00`;
  }

}
