import { Injectable } from '@angular/core';
import CameraInfo from './model/cameraInfo';

@Injectable({
  providedIn: 'root'
})
export class WebrtcService {

  stream: MediaStream | null = null;
  cameras: CameraInfo[] = [];
  ratio: string;
  ratioByDevices: any = {
    mobile: ['3:4', '9:16'],
    tablet: ['3:4', '9:16'],
    desktop: ['4:3', '16:9'],
  };
  resolutionByRatio: any = {
    '16:9': [
      { label: 'FullHD', width: 1920, height: 1080 },
      { label: 'HD', width: 1280, height: 720 },
      { label: 'PAL', width: 1024, height: 576 },
      { label: 'qHD', width: 960, height: 540 },
    ],
    '9:16': [
      { label: 'FullHD', width: 1080, height: 1920 },
      { label: 'HD', width: 720, height: 1280 },
      { label: 'qHD', width: 540, height: 960 },
      { label: 'PAL', width: 576, height: 1024 },
    ],
    '4:3': [
      { label: 'SXGA-', width: 1280, height: 960 },
      { label: 'XGA+', width: 1152, height: 864 },
      { label: 'XGA', width: 1024, height: 768 },
      { label: 'SVGA', width: 800, height: 600 },
      { label: 'VGA', width: 640, height: 480 },
    ],
    '3:4': [
      { label: 'SXGA-', width: 960, height: 1280 },
      { label: 'XGA+', width: 864, height: 1152 },
      { label: 'XGA', width: 768, height: 1024 },
      { label: 'SVGA', width: 600, height: 800 },
      { label: 'VGA', width: 480, height: 640 },
    ],
  };

  constructor() { }

  async initializeCamera() {
    await navigator.mediaDevices.enumerateDevices().then((result) => {
      const devices = result.filter((device) => device.kind === 'videoinput');
      if (devices.length > 0) {
        this.cameras = this.filterCameraInfo(devices);
        console.log('เรียกข้อมูลกล้องแล้ว: ', this.cameras);
      } else {
        console.warn('ไม่พบกล้อง');
      }
    }).catch((error) => {
      console.error('เกิดข้อผิดพลาดในการเรียกข้อมูลกล้อง: ', error);
    });
  }


  //filter cameras
  filterCameraInfo(cameras: MediaDeviceInfo[]) {
    // filter front and back camera for ios
    const cameraInfo: CameraInfo[] = [];
    const front = cameras.find((cam) => cam.label.includes('Front Camera'));
    const back = cameras.find((cam) => cam.label.includes('Back Camera'));

    if (front) {
      cameraInfo.push({
        label: front.label,
        side: 'Front Camera',
        deviceId: front.deviceId,
        wideScreen: [],
        fullScreen: []
      });
    }
    if (back) {
      cameraInfo.push({
        label: back.label,
        side: 'Back Camera',
        deviceId: back.deviceId,
        wideScreen: [],
        fullScreen: []
      });
    }

    // filter front and back camera for android
    let minFrontIndex: number | undefined;
    let minFrontDevice: MediaDeviceInfo | undefined;
    let minBackIndex: number | undefined;
    let minBackDevice: MediaDeviceInfo | undefined;

    if (!front && !back) {
      for (let device of cameras) {
        const deviceParts = device.label.split(',').map((item) => item.trim());
        const index = Number.parseInt(deviceParts[0].split(' ')[1]);
        const facing = deviceParts[1];

        if (facing === 'facing front') {
          if (minFrontIndex === undefined || index < minFrontIndex) {
            minFrontIndex = index;
            minFrontDevice = device;
          }
        }
        if (facing === 'facing back') {
          if (minBackIndex === undefined || index < minBackIndex) {
            minBackIndex = index;
            minBackDevice = device;
          }
        }
      }
      if (minFrontDevice) {
        cameraInfo.push({
          label: minFrontDevice.label,
          side: 'Front Camera',
          deviceId: minFrontDevice.deviceId,
          wideScreen: [],
          fullScreen: []
        });
      }
      if (minBackDevice) {
        cameraInfo.push({
          label: minBackDevice.label,
          side: 'Back Camera',
          deviceId: minBackDevice.deviceId,
          wideScreen: [],
          fullScreen: []
        });
      }
    }
    if (!front && !back && !minFrontDevice && !minBackDevice) {
      const device = cameras.find(() => true);
      if (device) {
        cameraInfo.push({
          label: device.label,
          side: 'Front Camera',
          deviceId: device.deviceId,
          wideScreen: [],
          fullScreen: []
        });
      }
    }
    return cameraInfo;
  }

  getFrontCamera() {
    return this.cameras.find((cameras: any) => cameras.side === 'Front Camera');
  }

  getBackCamera() {
    return this.cameras.find((cameras: any) => cameras.side === 'Back Camera');
  }

  async startUserMedia(deviceId: string, width: number, height: number) {
    try {
      let constraints = {
        video: {
          deviceId: deviceId,
          width: { exact: width },
          height: { exact: height },
        },
      };
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('เปิดกล้องแล้ว');
    } catch (error) {
      console.log(error);
    }
  }

  stopUserMedia(source: MediaStream | null) {
    try {
      if (source) {
        source.getTracks().forEach((track) => {
          track.stop();
        });
        console.log('ปิดกล้องแล้ว');
      }
    } catch (error) {
      console.log(error);
    }
  }
}
