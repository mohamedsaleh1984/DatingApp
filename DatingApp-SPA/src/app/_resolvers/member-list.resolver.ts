import {Injectable} from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { error } from 'protractor';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../_models/user';
import { AlertifyService } from '../_services/alertify.service';
import { UserService } from '../_services/user.service';

// to avoid ? (save navigation)
@Injectable()
export class MemeberListResolver implements Resolve<User[]> {

    pageNumber = 1;
    pageSize = 5;


    constructor(private userService: UserService,
                private router: Router,
                private alerfiService: AlertifyService) {}
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User[]> {
        return this.userService.getUsers(this.pageNumber, this.pageSize).pipe(
                catchError(error => {
                    this.alerfiService.error('Problem retrieving data.');
                    this.router.navigate(['/home']);
                    return of(null);
                })
            );
    }
}