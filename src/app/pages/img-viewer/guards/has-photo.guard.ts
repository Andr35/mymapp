import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {NAV_STATE_IMG_VIEWER_PHOTOS} from '@app/models/nav-contants';

@Injectable({
  providedIn: 'root'
})
export class HasPhotoGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {

    const photo = this.router.getCurrentNavigation()?.extras.state?.[NAV_STATE_IMG_VIEWER_PHOTOS];

    // Continue or return to root page
    return !!photo || this.router.createUrlTree(['/']);
  }

}
