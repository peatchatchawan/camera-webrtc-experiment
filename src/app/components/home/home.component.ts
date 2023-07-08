import { WebrtcService } from 'src/app/services/webrtc.service';
import { Component, OnInit } from '@angular/core';
import { NgxCheckPermissionService } from 'ngx-check-permission';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NativeService } from 'src/app/services/native.service';
import CameraInfo from 'src/app/services/model/cameraInfo';
import { ModalController } from '@ionic/angular';
import { FrontComponent } from '../front/front.component';
import { BackComponent } from '../back/back.component';
import { FrontcameraiosComponent } from '../ios/frontcameraios/frontcameraios.component';
import { BackcameraiosComponent } from '../ios/backcameraios/backcameraios.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {


  //deviceInfo 
  deviceInfo: any;
  devicePermission: any;
  device: string;
  deviceType: string;
  os: string;
  osVersion: string;
  browser: string;
  browserVersion: string;
  orientation: string;
  userAgent: string;
  cpu: number;
  memory: string;
  ratio: string[] = [];
  devices: InputDeviceInfo[];
  cameras: CameraInfo[] = [];
  requestPermissionMsg: string;
  statePermission: boolean = false;
  stateCamera: boolean = false;

  constructor(
    private webrtcService: WebrtcService,
    private nativeService: NativeService,
    private modalController: ModalController,
    private deviceDetectorService: DeviceDetectorService,
    private ngxCheckPermissionService: NgxCheckPermissionService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.nativeService.presentLoadingWithOutTime('Requesting permission...');
    await this.getDeviceInfoAndPermission();
  }


  async getDeviceInfoAndPermission() {
    this.deviceInfo = await this.deviceDetectorService.getDeviceInfo();
    this.devicePermission = await this.ngxCheckPermissionService.getAllPermissions();

    //deviceInfo
    this.device = this.deviceInfo.device;
    this.deviceType = this.deviceInfo.deviceType;
    this.os = this.deviceInfo.os;
    this.osVersion = this.deviceInfo.os_version;
    this.browser = this.deviceInfo.browser;
    this.browserVersion = this.deviceInfo.browser_version;
    this.orientation = this.deviceInfo.orientation;
    this.userAgent = this.deviceInfo.userAgent;
    this.cpu = navigator.hardwareConcurrency;
    this.memory = (navigator as any).deviceMemory;

    //check deviceType to set ratio when open camera
    switch (this.deviceType) {
      case 'mobile':
        this.webrtcService.ratio = ['3:4', '9:16'];
        break;
      case 'tablet':
        this.webrtcService.ratio = ['3:4', '9:16'];
        break;
      case 'desktop':
        this.webrtcService.ratio = ['4:3', '16:9'];
        break;
      default:
        console.log('unknown device');
        break;
    }
    this.ratio = await this.webrtcService.ratio;
    const permission = this.devicePermission[10];
    console.log('permission:', permission.state);
    switch (permission.state) {
      case 'granted':
        this.requestPermissionMsg = 'granted';
        this.statePermission = true;
        const enumerate = await navigator.mediaDevices.enumerateDevices();
        this.devices = await enumerate.filter((device) => device.kind === 'videoinput');
        this.webrtcService.initializeCamera().then(() => {
          this.cameras = this.webrtcService.cameras;
          this.stateCamera = true;
          console.log('cameras:', this.cameras);
        });
        break;
      case 'prompt':
        this.requestPermissionMsg = 'prompt';
        this.statePermission = false;
        break;
      case 'denied':
        this.requestPermissionMsg = 'denied';
        this.statePermission = false;
        break;
      default:
        console.log('default');
        break;
    }
    setTimeout(() => {
      this.nativeService.dismissLoading();
    }, 500);
  }

  requestPermissions(): void {
    this.nativeService.presentLoadingWithOutTime('Requesting permission...');
    navigator.mediaDevices.getUserMedia({ video: true }).then(async (stream) => {
      if (stream) {
        this.requestPermissionMsg = 'request permission successfully';
        this.statePermission = true;
        const enumerate = await navigator.mediaDevices.enumerateDevices();
        this.devices = await enumerate.filter((device) => device.kind === 'videoinput');
        this.webrtcService.initializeCamera().then(() => {
          this.cameras = this.webrtcService.cameras;
          this.stateCamera = true;
          console.log('cameras:', this.cameras);
        });
        this.nativeService.Toast('request permission successfully', 'bottom', 'success', 3);
      } else {
        this.requestPermissionMsg = 'permission denied Please reset the settings and request permission again.'
        this.statePermission = false;
        this.nativeService.Toast('permission denied Please reset the settings and request permission again.', 'bottom', 'danger', 3);
      }
      await this.nativeService.dismissLoading();
    }).catch(async (err) => {
      this.nativeService.presentAlert('unsuccessful from requestPermissions', err);
      this.requestPermissionMsg = err;
      this.statePermission = false;
      setTimeout(async () => {
        this.nativeService.dismissLoading();
      }, 500);
    });
  }

  async presentFrontCamera() {
    const modal = await this.modalController.create({
      component: FrontComponent,
    });
    await modal.present();
  }

  async presentBackCamera() {
    const modal = await this.modalController.create({
      component: BackComponent,
    });
    await modal.present();
  }

  async presentFrontCameraIos() {
    const modal = await this.modalController.create({
      component: FrontcameraiosComponent,
    });
    await modal.present();
  }

  async presentBackCameraIos() {
    const modal = await this.modalController.create({
      component: BackcameraiosComponent,
    });
    await modal.present();
  }


}
