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
  isLiked: string = 'false';
  currentUserId: number;

  constructor(private authService: AuthService,
    private alertService: AlertifyService,
    private userService: UserService) { }

  ngOnInit() {
    this.currentUserId = this.authService.decodedToken.nameid;
    this.userService.isLiked( this.currentUserId, this.user.id).subscribe( data => {
      this.isLiked = String(data);
    }, error => {
        this.alertService.error('Unexpected error - get likes');
    });
  }

  sendLike(id: number) {
    this.isLiked = 'true';
    
    this.userService
      .sendLike(  this.currentUserId, id)
      .subscribe(data => {
        this.alertService.success('You have Liked: ' + this.user.knownAs);
      }, error => {
        console.log(error);
        this.alertService.error(error);
      });
  }

  unlikeUser(id: number) {
    this.isLiked = 'false';

    this.userService
      .unLikeUser(  this.currentUserId, id)
      .subscribe(data => {
        this.alertService.success('You have Unliked: ' + this.user.knownAs);
      }, error => {
        console.log(error);
        this.alertService.error(error);
      });
  }

}
