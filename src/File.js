const path = require("path");

const fsp = require("fs/promises");

class File {
  constructor(buffer, name, encoding, mimeType, size) {
    this.buffer = buffer;
    this.name = name;
    this.encoding = encoding;
    this.mimeType = mimeType;
    this.size = size;
  }

  getBuffer() {
    return this.buffer;
  }

  getName() {
    return this.name;
  }

  getEncoding() {
    return this.encoding;
  }

  getMimeType() {
    return this.mimeType;
  }

  getSize() {
    return this.size;
  }

  async save(file) {
    const dir = path.dirname(file);

    await fsp.mkdir(dir, { recursive: true });

    await fsp.writeFile(file, this.buffer);
  }
}

module.exports = File;
