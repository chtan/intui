import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { environment } from "@environment/environment";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'intui';

  constructor(private http: HttpClient) {
    //console.log(environment.apiUrl);

    this.http.get('http://' + environment.apiUrl + '/welcome/echo?x=1')
      .subscribe(data => {
        console.log(data);
      });
  }
}
