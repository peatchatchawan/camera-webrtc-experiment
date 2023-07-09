import Resolution from "./resolution";

interface CameraInfo {
    label: string;
    side: string;
    deviceId: string;
    wideScreen: Resolution[];
    fullScreen: Resolution[];
}

export default CameraInfo;