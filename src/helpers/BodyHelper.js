const busboy = require("busboy");

const File = require("../File");

class BodyHelper {
  static parseBody(request) {
    return new Promise((resolve) => {
      const { "content-type": contentType = "text/plain" } = request.headers;

      const mime = contentType.split(";")[0].trim();

      const buffers = [];

      const end = () => {
        const buffer = Buffer.concat(buffers);

        let body = buffer;

        if (this.isJson(mime)) {
          try {
            const string = buffer.toString();

            body = JSON.parse(string);
          } catch (error) {}
        }

        resolve(body);
      };

      request.on("data", (data) => buffers.push(data));

      if (this.isFormData(mime) || this.isUrlEncoded(mime)) {
        try {
          const bb = busboy({ headers: request.headers });

          const body = {};

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

          bb.on("finish", () => resolve(body));

          bb.on("error", end);

          request.pipe(bb);

          return;
        } catch (error) {}
      }

      request.on("end", end);
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
