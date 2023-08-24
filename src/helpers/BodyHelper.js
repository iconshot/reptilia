const busboy = require("busboy");

const File = require("../File");

class BodyHelper {
  static parseBody(request) {
    let body = null;

    if (request.method === "GET" || request.method === "HEAD") {
      return body;
    }

    const { "content-length": contentLength = null } = request.headers;

    if (contentLength === null) {
      return body;
    }

    const { "content-type": contentType = "text/plain" } = request.headers;

    const mime = contentType.split(";")[0];

    if (this.isMultipart(mime) || this.isUrlEncoded(mime)) {
      return new Promise((resolve) => {
        body = {};

        const bb = busboy({ headers: request.headers });

        bb.on("file", (key, file, info) => {
          const { filename, encoding, mimeType } = info;

          const buffers = [];

          let size = 0;

          file.on("data", (data) => {
            buffers.push(data);

            size += data.length;
          });

          file.on("close", () => {
            const buffer = Buffer.concat(buffers);

            body[key] = new File(buffer, filename, encoding, mimeType, size);
          });
        });

        bb.on("field", (key, value) => {
          body[key] = value;
        });

        bb.on("error", () => {
          body = null;
        });

        bb.on("close", () => resolve(body));

        request.pipe(bb);
      });
    }

    return new Promise((resolve) => {
      let string = "";

      const buffers = [];

      request.on("data", (data) => buffers.push(data));

      request.on("end", () => {
        string = Buffer.concat(buffers).toString();

        if (this.isJson(mime)) {
          try {
            body = JSON.parse(string);
          } catch (error) {}
        } else {
          body = string;
        }

        resolve(body);
      });
    });
  }

  static isMultipart(mime) {
    return /^multipart\/.+$/i.test(mime);
  }

  static isUrlEncoded(mime) {
    return /^application\/x-www-form-urlencoded$/i.test(mime);
  }

  static isJson(mime) {
    return /^application\/json$/i.test(mime);
  }
}

module.exports = BodyHelper;
