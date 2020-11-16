import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsDatepickerConfig } from 'ngx-bootstrap';
import { User } from '../_models/user';
import { AlertifyService } from '../_services/alertify.service';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {
  // Child to Parent
  @Output() cancelRegister = new EventEmitter();
  // Parent to child
  @Input() valuesFromHome: any;
  user: User ;
  registrationForm: FormGroup;

  colorTheme = 'theme-red';
  bsConfig: Partial<BsDatepickerConfig>;

  constructor(private authService: AuthService,
              private router: Router,
              private alertifyService: AlertifyService,
              private fb: FormBuilder) { }

  ngOnInit() {
   this.createRegisterForm();
  }

  createRegisterForm() {
    this.registrationForm = this.fb.group({
        gender: ['male'],
        username: ['', Validators.required],
        knownAs: ['', Validators.required],
        dateOfBirth: [null, Validators.required],
        city: ['', Validators.required],
        country: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
        confirmPassword: ['', Validators.required]
    }, {Validators: this.passwordMatchValidator});
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme , isAnimated: true });

  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password').value === g.get('confirmPassword').value ? null : {'mismatch': true};
  }
  /*
    1. Check if registration form is Valid
    if valid => login if successful login navigate to members screen
    otherwise show errors depending on the stage.
    */
  register() {
    if (this.registrationForm.valid) {
      this.user = Object.assign({}, this.registrationForm.value);
      this.authService.register(this.user).subscribe(() => {
          this.alertifyService.success('Registration successful');
      }, error =>  {
          this.alertifyService.error(error);
      }, () => {
        this.authService.login(this.user).subscribe( () => {
          this.router.navigate(['/members']);
        }, error => {
          this.alertifyService.error('Error navigating to members page');
        });
      }
      );
    }
   // console.log(this.registrationForm.value);
  }

  cancel() {
    this.cancelRegister.emit(false);
  }
}
