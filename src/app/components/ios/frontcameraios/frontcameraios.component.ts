import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import CameraInfo from 'src/app/services/model/cameraInfo';
import captures from 'src/app/services/model/captures';
import { NativeService } from 'src/app/services/native.service';
import { WebrtcService } from 'src/app/services/webrtc.service';

@Component({
  selector: 'app-frontcameraios',
  templateUrl: './frontcameraios.component.html',
  styleUrls: ['./frontcameraios.component.scss']
})
export class FrontcameraiosComponent implements OnInit {

  @ViewChild('showVideo') showVideo: ElementRef<HTMLVideoElement>;
  @ViewChild('realVideo') realVideo: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvas2') canvas2: ElementRef<HTMLCanvasElement>;
  selectedRatio: string;
  ratio: string[] = [];
  realVideoWidth: number;
  realVideoHeight: number;
  useRatio: string;
  onChangeCamera: boolean;
  lastedRatioInput: string;
  targetCropHeight: number;
  targetCropWidth: number;
  passedResolutions: any[] = [];
  selectedResolution: any;
  originalImages: captures;
  resizeImages: captures | null;
  rotateImages: captures | null;
  onTakePhoto: boolean;
  configQualityImage: any = 0.9;

  constructor(
    private webrtcService: WebrtcService,
    private nativeService: NativeService,
    private modalController: ModalController
  ) { }

  async ngOnInit() {
    this.ratio = this.webrtcService.ratio;
  }


  async onDismiss(data: string, role: string) {
    this.webrtcService.stopUserMedia(this.webrtcService.stream);
    this.modalController.dismiss(data, role);
    console.log('ปิดกล้องแล้ว');
    this.nativeService.Toast('ปิดกล้องแล้ว', 'bottom', 'danger', 1);
  }

  async startCamera(ratio: string) {
    this.nativeService.presentLoadingWithOutTime('Opening camera...');
    const camera = await this.webrtcService.getBackCamera();
    if (camera) {
      this.openCameraByRatio(camera, ratio);
    } else {
      console.log('no camera');
      this.nativeService.presentAlert('ไม่พบกล้องถ่ายรูป', 'กรุณาเปิดกล้องถ่ายรูปและลองใหม่อีกครั้ง');
      setTimeout(async () => {
        this.modalController.dismiss();
        this.nativeService.dismissLoading();
      }, 500);
    }
  }

  openCameraByRatio(camera: CameraInfo, ratio: string, index: number = 0) {
    const resolutions = this.webrtcService.resolutionByRatio[ratio];
    console.log('resolutions:', resolutions);
    if (!resolutions) {
      console.log('Invalid ratio:', ratio);
      this.nativeService.presentAlert('Error', 'Invalid ratio');
      return;
    }

    if (index >= resolutions.length) {
      console.log('No suitable resolution found for the ratio:', ratio);
      this.nativeService.presentAlert('Error', 'No suitable resolution found for the ratio');
      return;
    }

    const resolution = resolutions[index];
    this.webrtcService.stopUserMedia(this.webrtcService.stream);
    navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: camera.deviceId ? { exact: camera.deviceId } : undefined,
        width: { exact: resolution.width },
        height: { exact: resolution.height },
        facingMode: camera.side === 'Front Camera' ? 'user' : 'environment',
      },
    }).then(async stream => {
      this.webrtcService.stream = stream;
      this.showVideo.nativeElement.srcObject = this.webrtcService.stream;
      this.realVideo.nativeElement.srcObject = this.webrtcService.stream;
      this.showVideo.nativeElement.onloadeddata = () => {
        this.showVideo.nativeElement.play();
        this.realVideo.nativeElement.play();
        const { videoWidth, videoHeight } = this.realVideo.nativeElement;
        this.realVideoWidth = videoWidth;
        this.realVideoHeight = videoHeight;
        this.useRatio = ratio;
        this.resolutionToCrop();
      };
      this.onChangeCamera = false;
      console.log('Camera opened successfully');
      this.nativeService.Toast('Camera opened successfully', 'bottom', 'success', 1);
      setTimeout(async () => {
        this.nativeService.dismissLoading();
      }, 500);
    }).catch(error => {
      if (error.name === 'OverconstrainedError') {
        console.log('OverconstrainedError, trying next resolution...');
        this.openCameraByRatio(camera, ratio, index + 1); // Try the next resolution
      } else {
        console.log('Error opening camera:', error);
        this.nativeService.presentAlert('Error', 'Error opening camera');
        setTimeout(async () => {
          this.nativeService.dismissLoading();
        }, 500);
      }
    });
  }

  async onRatioChange(event: any) {
    this.selectedRatio = event.detail.value;
    this.onChangeCamera = this.lastedRatioInput !== this.selectedRatio;
    if (this.selectedRatio === '4:3' || this.selectedRatio === '3:4') {
      await this.startCamera('4:3');
    } else if (this.selectedRatio === '16:9' || this.selectedRatio === '9:16') {
      await this.startCamera('16:9');
    }

    this.targetCropHeight = 0;
    this.targetCropWidth = 0;
    const resizeCanvas = this.canvas2.nativeElement;

    if (resizeCanvas.width !== 0 || resizeCanvas.height !== 0) {
      resizeCanvas.width = 0;
      resizeCanvas.height = 0;
    }
  }

  async resolutionToCrop() {
    const video = this.realVideo.nativeElement;
    const { videoWidth, videoHeight } = video;
    this.passedResolutions = await this.webrtcService.resolutionByRatio[this.selectedRatio]
      .filter((res: any) => res.width <= videoWidth && res.height <= videoHeight);
    console.log('passedResolutions:', this.passedResolutions);
  }


  onLowerResolution(event: any) {
    this.selectedResolution = event.detail.value;
    this.targetCropWidth = this.selectedResolution.width;
    this.targetCropHeight = this.selectedResolution.height;
    console.log(this.targetCropWidth, this.targetCropHeight);
  }

  async takePhoto() {
    try {
      const video = this.realVideo.nativeElement;
      const canvas = this.canvas.nativeElement;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL('image/jpeg', this.configQualityImage);
        const resolution = `${video.videoWidth}x${video.videoHeight}`;
        this.originalImages = { dataURL: dataURL, resolution: resolution, ratio: this.useRatio };
      }

      // resize image
      const resizeCanvas = this.canvas2.nativeElement;
      const resizeContext = resizeCanvas.getContext('2d');
      resizeCanvas.width = this.targetCropWidth;
      resizeCanvas.height = this.targetCropHeight;
      if (resizeContext) {
        if (resizeCanvas.width < 50 || resizeCanvas.height < 50) {
          this.resizeImages = null;
          this.nativeService.presentAlert('กรุณาเลือกขนาดรูปภาพ', 'กรุณาเลือกขนาดรูปใหม่ที่ต้องการ');
        } else {
          resizeContext.drawImage(video, 0, 0, resizeCanvas.width, resizeCanvas.height);
          const dataURL = resizeCanvas.toDataURL('image/jpeg', this.configQualityImage);
          const resolution = `${resizeCanvas.width}x${resizeCanvas.height}`;
          this.resizeImages = { dataURL: dataURL, resolution: resolution, ratio: this.useRatio };
        }
      }

      // rotate image
      if (this.resizeImages) {
        const image = new Image();
        image.src = this.resizeImages.dataURL;
        const loadImage = new Promise<void>((resolve) => {
          image.onload = () => resolve();
        });

        await loadImage; // Wait for the image to load
        const canvasRotated = document.createElement('canvas');
        const ctxRotated = canvasRotated.getContext('2d');
        if (ctxRotated) {
          canvasRotated.width = image.height;
          canvasRotated.height = image.width;
          ctxRotated.rotate(90 * Math.PI / 180);
          ctxRotated.translate(0, -canvasRotated.width);
          ctxRotated.drawImage(image, 0, 0);
          const rotatedDataURL = canvasRotated.toDataURL('image/jpeg', this.configQualityImage);
          this.rotateImages = { dataURL: rotatedDataURL, resolution: `${canvasRotated.width}x${canvasRotated.height}`, ratio: this.useRatio };
        }
      } else {
        this.rotateImages = null;
        console.log('not resize image');
      }

      this.onTakePhoto = true
    } catch (error) {
      console.log(error);
    }
  }

  downloadImage(dataURL: any) {
    // Download the rotated image
    const downloadLink = document.createElement('a');
    downloadLink.href = dataURL;
    downloadLink.download = 'image.jpg';
    downloadLink.click();
  }
}
