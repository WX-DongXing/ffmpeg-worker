// let file_buffer, pointer, ptr, index = 0;
// self.onmessage = (event) => {
//   // 从主进程获取的二进制文件内容
//   file_buffer = new Uint8Array(event.data);
//
//   pointer = Module._malloc(file_buffer.length);
//
//   ptr = Module.HEAP8.set(file_buffer, pointer);
//
//   Module._read_buffer(pointer, file_buffer.length);
//
//   // requestAnimationFrame(render);
//   this.render();
//
//   Module._free(file_buffer);
//   Module._free(pointer);
//   Module._free(ptr);
// }
//
// importScripts('ffmpeg.js');
//
// Module._onRuntimeInitialized = () => {
//   console.log('init');
// }
//
// function render() {
//   console.log(index++);
//   Module._get_yuv_frame();
//
//   let width = Module.HEAP32[0];
//
//   let height = Module.HEAP32[1];
//
//   let yBufferPtr = Module.HEAP32[2];
//
//   let uBufferPtr = Module.HEAP32[3];
//
//   let vBufferPtr = Module.HEAP32[4];
//
//   let yBuffer = Module.HEAPU8.subarray(yBufferPtr, yBufferPtr + width * height);
//
//   let uBuffer = Module.HEAPU8.subarray(uBufferPtr, uBufferPtr + width * height / 2);
//
//   let vBuffer = Module.HEAPU8.subarray(vBufferPtr, vBufferPtr + width * height / 2);
//
//   //  todo 共享内存
//   self.postMessage({
//     width: width,
//     height: height,
//     yFrame: yBuffer,
//     uFrame: uBuffer,
//     vFrame: vBuffer
//   })
//
//   let t1 = performance.now();
//   Module._free(yBufferPtr);
//   Module._free(uBufferPtr);
//   Module._free(vBufferPtr);
//   Module._free(yBuffer);
//   Module._free(uBuffer);
//   Module._free(vBuffer);
//   let t2 = performance.now();
//   console.log(t2 -t1);
//   // requestAnimationFrame(render);
// }


let file_buffer, pointer, ptr, videoIndex = 0;
let pFormatCtx = null;
let pCodecCtx = null;
let packet = null;
let pFrame = null;
let pFrameYUV = null;
let sws_ctx = null;
let yuv_frame = null;

self.onmessage = (event) => {
  // 从主进程获取的二进制文件内容
  file_buffer = new Uint8Array(event.data);

  pointer = Module._malloc(file_buffer.length);

  ptr = Module.HEAP8.set(file_buffer, pointer);



  pFormatCtx = Module._get_pFormatCtx(pointer, file_buffer.length);

  videoIndex = Module._get_video_index(pFormatCtx);

  pCodecCtx = Module._get_pCodecCtx(pFormatCtx, videoIndex);

  pFrame = Module._get_pFrame(pFrame);

  pFrameYUV = Module._get_pFrameYUV(pFrameYUV);

  sws_ctx = Module._get_sws_ctx(pFrameYUV, pCodecCtx, sws_ctx);

  packet = Module._get_packet();

  while (Module._av_read_frame(pFormatCtx, packet) >= 0) {

    if (Module._get_packet_stream_index(packet) === videoIndex) {

      Module._avcodec_send_packet(pCodecCtx, packet);

      if (Module._avcodec_receive_frame(pCodecCtx, pFrame) !== 0) {
        continue;
      }

      Module._run_sws_scale(sws_ctx, pFrame, pFrameYUV, pCodecCtx);

      yuv_frame = Module._yuv_frame(pCodecCtx, pFrameYUV);

      this.render();

    }
  }


  Module._free_memory();
  Module._free(file_buffer);
  Module._free(pointer);
  Module._free(ptr);
}

importScripts('ffmpeg.js');

Module._onRuntimeInitialized = () => {
  console.log('init');
}

function render() {
  let width = Module.HEAP32[yuv_frame / 4];

  let height = Module.HEAP32[yuv_frame / 4 + 1];

  let yBufferPtr = Module.HEAP32[yuv_frame / 4 + 2];

  let uBufferPtr = Module.HEAP32[yuv_frame / 4 + 3];

  let vBufferPtr = Module.HEAP32[yuv_frame / 4 + 4];

  let yBuffer = Module.HEAPU8.subarray(yBufferPtr, yBufferPtr + width * height);

  let uBuffer = Module.HEAPU8.subarray(uBufferPtr, uBufferPtr + width * height / 2);

  let vBuffer = Module.HEAPU8.subarray(vBufferPtr, vBufferPtr + width * height / 2);

  //  todo 共享内存
  self.postMessage({
    width: width,
    height: height,
    yFrame: yBuffer,
    uFrame: uBuffer,
    vFrame: vBuffer
  })
}
