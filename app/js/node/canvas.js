// a minimalistic, but sufficient, implementation of the canvas API
export default class Canvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.buffer = new ArrayBuffer(width * height * 4);
    this.data = new Uint8ClampedArray(this.buffer);
  }
  getContext() {
    return this; // haha, tricked
  }
  createImageData() {
    return { data: this.data };
  }
  putImageData(src, x, y, dx, dy, w, h) {
    var srcbuffer = src.data.buffer;
    for (var i=0; i<0+w; i+=1) {
      for (var j=0; j<0+h; j+=1) {
        var srcIndex = ((j+dy)*src.width+(i+dx))*4;
        var destIndex = (j*this.width+i)*4;
        this.buffer[destIndex] = srcbuffer[srcIndex];
        this.buffer[destIndex+1] = srcbuffer[srcIndex+1];
        this.buffer[destIndex+2] = srcbuffer[srcIndex+2];
        this.buffer[destIndex+3] = srcbuffer[srcIndex+3];
      }
    }
  }
}
