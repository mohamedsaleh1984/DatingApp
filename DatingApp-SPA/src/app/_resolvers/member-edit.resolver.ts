import {Injectable} from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { error } from 'protractor';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../_models/user';
import { AlertifyService } from '../_services/alertify.service';
import { AuthService } from '../_services/auth.service';
import { UserService } from '../_services/user.service';

// to avoid ? (save navigation)
/*
    Becuase we need to resolve the user id from the decoded token
    we need to inject AuthService to get that
*/
@Injectable()
export class MemeberEditResolver implements Resolve<User> {
    constructor(private userService: UserService, private authService: AuthService,
                private router: Router,
                private alerfiService: AlertifyService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User>{
        return this.userService.getUser(this.authService.decodedToken.nameid).pipe(
                catchError (error => {
                    this.alerfiService.error('Problem retriving data.');
                    this.router.navigate(['/members']);
                    return of(null);
                })
            );
    }
}