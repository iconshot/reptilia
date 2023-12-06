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

    const mime = contentType.split(";")[0].trim();

    if (this.isFormData(mime) || this.isUrlEncoded(mime)) {
      try {
        const bb = busboy({ headers: request.headers });

        return new Promise((resolve) => {
          body = {};

          bb.on("file", (key, file, info) => {
            const { filename, encoding, mimeType } = info;

            const buffers = [];

            file.on("data", (data) => buffers.push(data));

            file.on("close", () => {
              const buffer = Buffer.concat(buffers);

              const file = new File(buffer, filename, encoding, mimeType);

              body[key] = file;
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
      } catch (error) {}
    }

    return new Promise((resolve) => {
      const buffers = [];

      request.on("data", (data) => buffers.push(data));

      request.on("end", () => {
        const buffer = Buffer.concat(buffers);

        body = buffer;

        if (this.isJson(mime)) {
          try {
            const string = buffer.toString();

            body = JSON.parse(string);
          } catch (error) {}
        }

        resolve(body);
      });
    });
  }

  static isFormData(mime) {
    return /^multipart\/form-data$/i.test(mime);
  }

  static isUrlEncoded(mime) {
    return /^application\/x-www-form-urlencoded$/i.test(mime);
  }

  static isJson(mime) {
    return /^application\/json$/i.test(mime);
  }
}

module.exports = BodyHelper;
