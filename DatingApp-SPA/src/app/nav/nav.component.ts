import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
             private alertifyService: AlertifyService,
             private routerService: Router) { }

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
      },
      () => {
        // redirect user to members page
        this.routerService.navigate(['/members']);
      }
      );
  }

  loggedIn() {
    return this.authService.loggedIn();
  }

  logout() {
      localStorage.removeItem('token');
      // console.log('logged out');
      this.alertifyService.message('logged out.');
      // redirect user to home page.
      this.routerService.navigate(['/home']);
  }

}
