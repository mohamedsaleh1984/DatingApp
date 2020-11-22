import { Component, Input, OnInit } from '@angular/core';
import { User } from 'src/app/_models/user';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { AuthService } from 'src/app/_services/auth.service';
import { UserService } from 'src/app/_services/user.service';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css']
})

export class MemberCardComponent implements OnInit {
  @Input() user: User;

  constructor(private authService: AuthService,
              private alertService: AlertifyService,
              private userService: UserService) { }

  ngOnInit() {
  }

  sendLike(id: number) {
    this.userService
        .sendLike(this.authService.decodedToken.nameid,id)
        .subscribe(data => {
            this.alertService.success('You have Liked: ' + this. user.knownAs);
        }, error => {
            console.log(error);
            this.alertService.error(error);
        });
  }

}
