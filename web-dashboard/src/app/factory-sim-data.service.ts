import { Injectable } from '@angular/core';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { collection, getDocs } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";

@Injectable({
  providedIn: 'root'
})
export class FactorySimDataService {
  /*firebaseConfig = {
    apiKey: "AIzaSyDubTcGa7qc1co_05LHjCpapSqXXVHPJKc",
    authDomain: "factorysim-20ceb.firebaseapp.com",
    databaseURL: "https://factorysim-20ceb-default-rtdb.firebaseio.com",
    projectId: "factorysim-20ceb",
    storageBucket: "factorysim-20ceb.appspot.com",
    messagingSenderId: "948040349714",
    appId: "1:948040349714:web:6e37e11b96bd38d51b80cb",
    measurementId: "G-96L6FD5NME"
  }*/
  firebaseConfig = {
    apiKey: "AIzaSyCVi-KS8ohO-e0vOMkPOhInT1kEbDqK85Y",
    authDomain: "manufacturingsim2.firebaseapp.com",
    projectId: "manufacturingsim2",
    storageBucket: "manufacturingsim2.appspot.com",
    messagingSenderId: "569727327780",
    appId: "1:569727327780:web:ea075fe69643547fe702b1",
    measurementId: "G-DZ1KNTEM6X"
  };
  app = initializeApp(this.firebaseConfig);
  db = getFirestore(this.app);

  data: { [day: string]: {} } = {};
  dates: string[] = [];

  runs: string[] = []

  dataFetched: boolean = false;
  dataFetching: boolean = false;

  constructor() { }

  async fetchAllData(seed:string){
    this.data = {};
    this.dates = [];
    this.dataFetching = true;
    const querySnapshot = await getDocs(collection(this.db, seed));
    querySnapshot.forEach((doc) => {
      if(doc.id in this.data){
      }else{
        this.data[doc.id] = doc.data();
      }
      if(doc.id != "TotalProd" && !this.dates.includes(doc.id)) {
        this.dates.push(doc.id);
      }
    });
    await this.fetchRuns();
    this.dates = this.sortByDate(this.dates);
    this.dataFetched = true;
    this.dataFetching = false;
    console.log(this.dates);
  }

  sortByDate(dates: string[]): string[] {
    return dates.sort((date1: string, date2: string) => {
      const parts1 = date1.split("-");
      const parts2 = date2.split("-");

      // Convert each part to a number for comparison
      const year1 = parseInt(parts1[2], 10);
      const month1 = parseInt(parts1[1], 10);
      const day1 = parseInt(parts1[0], 10);

      const year2 = parseInt(parts2[2], 10);
      const month2 = parseInt(parts2[1], 10);
      const day2 = parseInt(parts2[0], 10);

      // Compare dates in order: year, month, day
      if (year1 < year2) return -1;
      if (year1 > year2) return 1;
      if (month1 < month2) return -1;
      if (month1 > month2) return 1;
      if (day1 < day2) return -1;
      if (day1 > day2) return 1;
      return 0; // Equal dates
    });
  }

  async fetchRuns(){
    this.runs = [];
    const querySnapshot = await getDocs(collection(this.db, "runs"));
    querySnapshot.forEach((doc) => {
      if(!this.runs.includes(doc.id)) {
        this.runs.push(doc.id);
      }
    });
    console.log(this.runs);
  }




  /*async fetchDataByDay(seed:string, day:string) {
    const docRef = doc(this.db, seed, day);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      this.dataFetched = true;
      this.data = docSnap.data();
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }

    return docSnap.data();
  }

  async fetchAllData(){
    const querySnapshot = await getDocs(collection(this.db, "123"));
    querySnapshot.forEach((doc) => {
      console.log(doc.data());
    });
  }

  async fetchDataById(seed:string, id: string){
    const docRef = doc(this.db, seed, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      this.dataFetched = true;
      this.data = docSnap.data()
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  }

  getTotalProduction(){
    if('production' in this.data) {
      const totalProduction = (this.data.production as {total: {}}).total
      console.log("getting data production")
      return totalProduction
    }else{
      console.log("no data information")
      return null
    }
  }

  getDailyProduction(){
    if('production' in this.data) {
      const totalProduction = (this.data.production as {daily: {}}).daily
      console.log("getting data production")
      return totalProduction
    }else{
      console.log("no data information")
      return null
    }
  }*/
}
