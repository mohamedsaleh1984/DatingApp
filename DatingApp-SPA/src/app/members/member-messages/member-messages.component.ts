import { Component, Input, OnInit } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Message } from 'src/app/_models/message';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { AuthService } from 'src/app/_services/auth.service';
import { UserService } from 'src/app/_services/user.service';


@Component({
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css']
})

export class MemberMessagesComponent implements OnInit {
  @Input() recipientId: number;
  messages: Message[];
  currentUserId: any;
  newMessage: any = {};

  constructor(private authService: AuthService,
    private userService: UserService,
    private alertfiyService: AlertifyService) { }

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    this.currentUserId = this.authService.decodedToken.nameid;
    this.userService.getMessageThread(this.currentUserId, this.recipientId)
      .pipe(tap(messages => {
        for (let i = 0; i < messages.length; i++) {
          if (messages[i].isRead === false && messages[i].recipientId === +this.currentUserId) {
            this.userService.markMessageAsRead(messages[i].id, +this.currentUserId);
          }
        }
      }))
      .subscribe(
        messages => {
          this.messages = messages;
        }, error => {
          this.alertfiyService.error(error);
        }
      );
  }

  sendMessage() {
    this.newMessage.recipientId = this.recipientId;
    this.userService.sendMessage(this.currentUserId, this.newMessage)
      .subscribe((message: Message) => {
        this.messages.unshift(message);
        this.newMessage.content = '';
      },
        error => {
          this.alertfiyService.error(error);
        }
      );
  }
}
