import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Photo } from 'src/app/_models/Photo';
import { FileUploader } from 'ng2-file-upload';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/_services/auth.service';
import { UserService } from 'src/app/_services/user.service';
import { AlertifyService } from 'src/app/_services/alertify.service';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {

  @Input() photos: Photo[];
  @Output() getMemeberPhotoChange = new EventEmitter<string>();
  uploader: FileUploader;
  hasBaseDropZoneOver: false;
  baseUrl = environment.apiUrl;
  currentMainPhoto: Photo;
  currentUserId: any;


  constructor(private authService: AuthService,
    private userService: UserService,
    private alerfiyService: AlertifyService) {

  }

  ngOnInit() {
    this.currentUserId = this.authService.decodedToken.nameid;
    this.initializeUploader();
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  initializeUploader() {
    this.uploader = new FileUploader({
      url: this.baseUrl + 'users/' + this.currentUserId + '/photos',
      authToken: 'Bearer ' + localStorage.getItem('token'),
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024
    });

    // to avoid cors error
    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };

    // To refresh the page after uploading the photos, adding a handler to do that.
    this.uploader.onSuccessItem = (item, response, status, headers) => {
      if (response) {
        const res: Photo = JSON.parse(response);
        const photo = {
          id: res.id,
          url: res.url,
          dateAdded: res.dateAdded,
          description: res.description,
          isMain: false,
          isPublic: res.isPublic
        };

        // if user doesn't have any photo, set the first photo in the list to be main by default.
        if (this.photos.length === 0) {
          photo.isMain = true;
          this.authService.changeMemeberPhoto(photo.url);
          this.authService.currentUser.photoUrl = photo.url;
          localStorage.setItem('user', JSON.stringify(this.authService.currentUser));
        }

        this.photos.push(photo);
      }
    };
  }

  setMainPhoto(photo: Photo) {
    this.userService.setMainPhoto(this.currentUserId, photo.id).subscribe(() => {
      this.currentMainPhoto = this.photos.filter(p => p.isMain === true)[0];
      this.currentMainPhoto.isMain = false;
      photo.isMain = true;
      //  this.getMemeberPhotoChange.emit(photo.url);
      this.authService.changeMemeberPhoto(photo.url);
      this.authService.currentUser.photoUrl = photo.url;
      localStorage.setItem('user', JSON.stringify(this.authService.currentUser));
    },
      error => {
        this.alerfiyService.error('Failed to set main photo');
      });
  }

  deletePhoto(id: number) {
    this.alerfiyService.confirm('Are you sure you want to delete this photo?', () => {
      this.userService.deletePhoto(this.currentUserId, id).subscribe(() => {
        this.photos.splice(this.photos.findIndex(p => p.id === id), 1);
        this.alerfiyService.success('Photo has been deleted.');
      }, error => {
        this.alerfiyService.error('Failed to delete the photo' + error);
      });
    });
  }
}
