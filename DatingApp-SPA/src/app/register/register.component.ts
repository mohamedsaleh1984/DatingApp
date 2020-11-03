import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AlertifyService } from '../_services/alertify.service';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  // Parent to Child
  @Input() valuesFromHome: any;

  // Child to Parent
  @Output() cancelRegister = new EventEmitter();

  model: any = {};

  constructor(private authService: AuthService,
            private alertifyService: AlertifyService) { }

  ngOnInit() {
  }

  register() {
    this.authService.register(this.model).subscribe(() => {
      // console.log('registration successful');
      this.alertifyService.success('registration successful');
    } , error => {
      this.alertifyService.error(error);
      // console.log (error);
    });
    // console.log(this.model);
  }

  cancel() {
    this.cancelRegister.emit(false);
    console.log('cancelled');
  }

}
