const http = require("http");

const requestHandler = require("./request-handler");

const staticMiddleware = require("./middlewares/static-middleware");

const Middleware = require("./Middleware");

class Server {
  constructor() {
    this.middlewares = [];

    this.server = http.createServer(requestHandler(this));
  }

  getServer() {
    return this.server;
  }

  getMiddlewares() {
    return this.middlewares;
  }

  add(method, ...args) {
    const middleware = new Middleware(method, ...args);

    this.middlewares.push(middleware);
  }

  use(...args) {
    this.add(null, ...args);
  }

  get(...args) {
    this.add("get", ...args);
  }

  post(...args) {
    this.add("post", ...args);
  }

  head(...args) {
    this.add("head", ...args);
  }

  put(...args) {
    this.add("put", ...args);
  }

  delete(...args) {
    this.add("delete", ...args);
  }

  connect(...args) {
    this.add("connect", ...args);
  }

  options(...args) {
    this.add("options", ...args);
  }

  trace(...args) {
    this.add("trace", ...args);
  }

  patch(...args) {
    this.add("patch", ...args);
  }

  static(path, dir, options = {}) {
    const tmpPath = `${path !== "/" ? path : ""}/:empty*:`;

    const middleware = staticMiddleware(path, dir, options);

    this.use(tmpPath, middleware);
  }

  start(port) {
    return new Promise((resolve, reject) => {
      this.server.on("error", (error) => reject(error));

      this.server.listen(port, resolve);
    });
  }
}

module.exports = Server;
