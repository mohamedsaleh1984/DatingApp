import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TabsetComponent } from 'ngx-bootstrap';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from 'ngx-gallery';
import { User } from 'src/app/_models/user';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { AuthService } from 'src/app/_services/auth.service';
import { UserService } from 'src/app/_services/user.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {
  @ViewChild('memberTabs') memberTabs: TabsetComponent;

  user: User;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];
  currentUserId: any;

  constructor(private userService: UserService,
    private alertifyService: AlertifyService,
    private authService: AuthService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.currentUserId = this.authService.decodedToken.nameid;
    this.route.data.subscribe(data => {
      this.user = data['user'];
    });
    // access query parameter.
    this.route.queryParams.subscribe(params => {
        const selectedTab = params['tab'];
        this.memberTabs.tabs[selectedTab > 0 ? selectedTab : 0].active = true;
    });

    this.galleryOptions = [
      {
        width: '500px',
        height: '500px',
        imagePercent: 100,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false
      }
    ];
    this.galleryImages = this.getImages();
  }


  getImages() {
    const imageUrls = [];
    for (let i = 0; i < this.user.photos.length; i++) {
      imageUrls.push(
        {
          small: this.user.photos[i].url,
          medium: this.user.photos[i].url,
          big: this.user.photos[i].url,
          descriprion: this.user.photos[i].description
        });
    }
    return imageUrls;
  }

  selectTab(tabId: number) {
    this.memberTabs.tabs[tabId].active = true;
  }

  sendLike(id: number) {
    this.userService
      .sendLike(this.currentUserId, id)
      .subscribe(data => {
        this.alertifyService.success('You have Liked: ' + this.user.knownAs);
      }, error => {
        console.log(error);
        this.alertifyService.error(error);
      });
  }
}
