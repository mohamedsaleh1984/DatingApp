import { Message } from '../_models/message';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AlertifyService } from '../_services/alertify.service';
import { UserService } from '../_services/user.service';
import { AuthService } from '../_services/auth.service';

// to avoid ? (save navigation)

@Injectable()
export class MessagesResolver implements Resolve<Message[]> {

    pageNumber = 1;
    pageSize = 5;
    messageContainer = 'Unread';

    constructor(private userService: UserService,
        private router: Router,
        private authService: AuthService,
        private alerfiyService: AlertifyService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Message[]> {
        return this.userService.getMessages(
            this.authService.decodedToken.nameid,
            this.pageNumber,
            this.pageSize,
            this.messageContainer).pipe(
                catchError(error => {
                    this.alerfiyService.error('Problem retrieving messages.');
                    this.router.navigate(['/home']);
                    return of(null);
                })
            );
    }
}