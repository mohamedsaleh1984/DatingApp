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
export class MemeberDetailResolver implements Resolve<User> {
    constructor(private userService: UserService,
                private router: Router,
                private alerfiService: AlertifyService) {}
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User>{
        
        return this.userService.getUser(route.params['id']).pipe(
                catchError(error => {
                    this.alerfiService.error('Problem retriving data.');
                    this.router.navigate(['/members']);
                    return of(null);
                })
            );
    }
                
}