import { Message } from '../_models/message';
import { Component, OnInit } from '@angular/core';
import { PaginatedResult, Pagination } from '../_models/Pagination';
import { UserService } from '../_services/user.service';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  messages: Message[];
  pagination: Pagination;
  messageContainer = 'Unread';
  currentUserId: any;

  constructor(private userServs: UserService,
    private authServs: AuthService,
    private alertfyServs: AlertifyService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.currentUserId = this.authServs.decodedToken.nameid;
    // Get data
    this.route.data.subscribe(data => {
      this.messages = data['messages'].result;
      this.pagination = data['messages'].pagination;
    });
  }

  loadMessages() {
    /**/
    this.userServs.getMessages(this.currentUserId,
      this.pagination.currentPage,
      this.pagination.itemsPerPage,
      this.messageContainer).subscribe((res: PaginatedResult<Message[]>) => {
        this.messages = res.result;
        this.pagination = res.pagination;
      }, error => {
        this.alertfyServs.error(error);
      });
  }

  pageChanged(event: any): void {
    this.pagination.currentPage = event.page;
    this.loadMessages();
  }

  deleteMessage(messageId: number) {
    this.alertfyServs.confirm('Are you sure you want to delete this message?', () => {
      this.userServs.deleteMessage(messageId, this.currentUserId).subscribe(() => {
        this.messages.splice(this.messages.findIndex(m => m.id === messageId), 1);
        this.alertfyServs.success('Message has been deleted.');
      }, error => {
        this.alertfyServs.error('Failed to delete the message.');
      });
    });
  }
}
