import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'intui';

  constructor(private http: HttpClient) {
    this.http.get('http://localhost:8000/welcome/echo?x=123')
      .subscribe(data => {
        console.log(data);
      });
  }
}
