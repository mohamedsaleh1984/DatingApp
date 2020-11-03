import { Component, OnInit } from '@angular/core';
import { AlertifyService } from '../_services/alertify.service';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  model: any = {};

  constructor(public authService: AuthService,
             private alertifyService: AlertifyService) { }

  ngOnInit() {
  }

  login() {
    this.authService.login(this.model).subscribe(

      next => {
        this.alertifyService.success('Logged in successfully');
       //   console.log('Logged in successfully');
      }, error => {
          this.alertifyService.error(error);
       // console.log(error);
      });
  }

  loggedIn() {
    return this.authService.loggedIn();
  }

  logout() {
      localStorage.removeItem('token');
      // console.log('logged out');
      this.alertifyService.message('logged out.');
  }

}