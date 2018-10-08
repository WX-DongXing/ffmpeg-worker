import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import YUVCanvas from 'yuv-canvas';
import YUVBuffer from 'yuv-buffer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'ffmpeg-worker';
  worker: any;
  reader: FileReader = new FileReader();
  @ViewChild('file') file: ElementRef;
  @ViewChild('canvas') canvasRef: ElementRef;
  @ViewChild('yPic') yPic: ElementRef;
  @ViewChild('uPic') uPic: ElementRef;
  @ViewChild('vPic') vPic: ElementRef;

  format: any;
  frame: any;
  yuvCanvas: any;
  sourceData: any;

  constructor() {
    this.sourceData = {
      y: null,
      u: null,
      v: null
    };
  }

  ngOnInit() {
    if (typeof (Worker) !== 'undefined') {
      if (typeof (this.worker) === 'undefined') {
        this.worker = new Worker('../assets/webWorker/worker.js');

        this.reader.onload = () => {
          this.worker.postMessage(this.reader.result, [this.reader.result]);
        };

        this.worker.onmessage = (event) => {
          this.format = YUVBuffer.format({
            width: event.data.width,
            height: event.data.height,
            chromaWidth: event.data.width / 2,
            chromaHeight: event.data.height / 2
          });
          this.frame = YUVBuffer.frame(this.format);
          this.frame.y.bytes = event.data.yFrame;
          this.frame.u.bytes = event.data.uFrame;
          this.frame.v.bytes = event.data.vFrame;
          this.yuvCanvas.drawFrame(this.frame);
          // this.yuvCanvas.clear();
        };
      }
    }
  }

  ngOnDestroy() {

  }

  ngAfterViewInit() {
    this.yuvCanvas = YUVCanvas.attach(this.canvasRef.nativeElement);
    setTimeout(() => {
      // this.draw_init();
    }, 0);
  }

  fileChange() {
    this.reader.readAsArrayBuffer(this.file.nativeElement.files[0]);
  }

  draw_init() {
    this.format = YUVBuffer.format({
      width: 640,
      height: 480,
      chromaWidth: 320,
      chromaHeight: 240
    });

    this.frame = YUVBuffer.frame(this.format);
    this.yuvCanvas.drawFrame(this.frame);
    // this.draw();
  }
  //
  // extractImageData(image) {
  //   const canvas = document.createElement('canvas');
  //   canvas.width = image.naturalWidth;
  //   canvas.height = image.naturalHeight;
  //
  //   const context = canvas.getContext('2d');
  //   context.drawImage(image, 0, 0);
  //   return context.getImageData(0, 0, canvas.width, canvas.height);
  // }
  //
  // copyBrightnessToPlane(imageData, plane, width, height) {
  //   // Because we're doing multiplication that may wrap, use the browser-optimized
  //   // Uint8ClampedArray instead of the default Uint8Array view.
  //   // console.log('before: ', this.frame);
  //   const clampedBytes = new Uint8ClampedArray(plane.bytes.buffer, plane.bytes.offset, plane.bytes.byteLength);
  //   for (let y = 0; y < height; y++) {
  //     for (let x = 0; x < width; x++) {
  //       clampedBytes[y * plane.stride + x] = imageData.data[y * width * 4 + x * 4];
  //     }
  //   }
  // }
  //
  // draw() {
  //   this.sourceData.y = this.extractImageData(this.yPic.nativeElement);
  //   this.sourceData.u = this.extractImageData(this.uPic.nativeElement);
  //   this.sourceData.v = this.extractImageData(this.vPic.nativeElement);
  //   this.copyBrightnessToPlane(this.sourceData.y, this.frame.y, this.format.width, this.format.height);
  //   this.copyBrightnessToPlane(this.sourceData.u, this.frame.u, this.format.chromaWidth, this.format.chromaHeight);
  //   this.copyBrightnessToPlane(this.sourceData.v, this.frame.v, this.format.chromaWidth, this.format.chromaHeight);
  //   this.yuvCanvas.drawFrame(this.frame);
  // }

}
