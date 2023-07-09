import { WebrtcService } from './../../services/webrtc.service';
import { NativeService } from './../../services/native.service';
import { NgxCheckPermissionService } from 'ngx-check-permission';
import { DeviceDetectorService, DeviceInfo } from 'ngx-device-detector';
import { Component, OnInit } from '@angular/core';
import CameraInfo from 'src/app/services/model/cameraInfo';
import { ModalController } from '@ionic/angular';
import { FrontComponent } from '../android/front/front.component';
import { BackComponent } from '../android/back/back.component';

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


  //permission
  stateCameraPermission: string;

  //camera
  cameras: CameraInfo[] = [];

  constructor(
    private modalController: ModalController,
    private deviceDetectorService: DeviceDetectorService,
    private ngxCheckPermissionService: NgxCheckPermissionService,
    private nativeService: NativeService,
    private webrtcService: WebrtcService
  ) { }

  ngOnInit(): void {
    this.requestInformation();
  }

  async requestInformation() {
    try {
      this.nativeService.presentLoadingWithOutTime('Loading...');
      const [deviceInfo, devicePermission] = await Promise.all([
        this.deviceDetectorService.getDeviceInfo(),
        this.ngxCheckPermissionService.getAllPermissions()
      ]);
      this.handleDeviceInfo(deviceInfo);
      this.handleCameraPermission(devicePermission);
      setTimeout(() => {
        this.nativeService.dismissLoading();
      }, 500);
    } catch (error) {
      console.log(error);
      setTimeout(() => {
        this.nativeService.dismissLoading();
      }, 500);
    }
  }

  handleDeviceInfo(deviceInfo: DeviceInfo) {
    this.device = deviceInfo.device;
    this.deviceType = deviceInfo.deviceType;
    this.os = deviceInfo.os;
    this.osVersion = deviceInfo.os_version;
    this.browser = deviceInfo.browser;
    this.browserVersion = deviceInfo.browser_version;
    this.orientation = deviceInfo.orientation;
    this.userAgent = deviceInfo.userAgent;
    this.cpu = navigator.hardwareConcurrency;
    this.memory = (navigator as any).deviceMemory;

    // Check deviceType to set ratio when open camera
    switch (this.deviceType) {
      case 'mobile':
        console.log('mobile');
        this.webrtcService.ratio = this.webrtcService.ratioByDevices.mobile;
        break;
      case 'tablet':
        console.log('tablet');
        this.webrtcService.ratio = this.webrtcService.ratioByDevices.tablet;
        break;
      case 'desktop':
        console.log('desktop');
        this.webrtcService.ratio = this.webrtcService.ratioByDevices.desktop;
        break;
      default:
        console.log('unknown device');
        break;
    }

    console.log(this.webrtcService.ratio);
  }

  handleCameraPermission(devicePermission: any[]) {
    const cameraPermission = devicePermission[10];
    switch (cameraPermission.state) {
      case 'granted':
        this.stateCameraPermission = 'granted';
        this.handleDevices();
        break;
      case 'denied':
        this.stateCameraPermission = 'denied';
        break;
      case 'prompt':
        this.stateCameraPermission = 'prompt';
        break;
      default:
        this.stateCameraPermission = 'unknown';
        break;
    }
  }

  requestPermission() {
    this.nativeService.presentLoadingWithOutTime('Request Permission...');
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (stream) {
        this.stateCameraPermission = 'granted';
        this.handleDevices();
      } else {
        this.stateCameraPermission = 'denied';
      }
      setTimeout(() => {
        this.nativeService.dismissLoading();
      }, 500);
    }).catch((err) => {
      console.log(err);
      setTimeout(async () => {
        this.nativeService.dismissLoading();
      }, 500);
    });
  }

  async handleDevices() {
    await this.webrtcService.initializeCamera().then(() => {
      this.cameras = this.webrtcService.cameras;
    });
  }

  async presentFrontAndroidModal() {
    const modal = await this.modalController.create({
      component: FrontComponent,
      showBackdrop: true,
    });

    await modal.present();

    const data = await modal.onDidDismiss();
    console.log(data)

  }

  async presentBackAndroidModal() {
    const modal = await this.modalController.create({
      component: BackComponent,
      showBackdrop: true,
    });

    await modal.present();

    const data = await modal.onDidDismiss();
    console.log(data)

  }


}
