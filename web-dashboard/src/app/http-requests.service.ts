import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpRequestsService {

  constructor(private http: HttpClient) { }

  runSim(url: string, requestBody: any) {
    console.log("post req")
    // Define headers if needed
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Make HTTP POST request
    return this.http.post<any>(url, requestBody, { headers });
  }
}
