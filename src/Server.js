const http = require("http");

const requestHandler = require("./request-handler");

const staticMiddleware = require("./middlewares/static-middleware");

const Middleware = require("./Middleware");

class Server {
  constructor() {
    this.middlewares = [];
  }

  getMiddlewares() {
    return this.middlewares;
  }

  use(...args) {
    const middleware = new Middleware(...args);

    this.middlewares.push(middleware);
  }

  get(...args) {
    const middleware = new Middleware("get", ...args);

    this.middlewares.push(middleware);
  }

  post(...args) {
    const middleware = new Middleware("post", ...args);

    this.middlewares.push(middleware);
  }

  head(...args) {
    const middleware = new Middleware("head", ...args);

    this.middlewares.push(middleware);
  }

  put(...args) {
    const middleware = new Middleware("put", ...args);

    this.middlewares.push(middleware);
  }

  delete(...args) {
    const middleware = new Middleware("delete", ...args);

    this.middlewares.push(middleware);
  }

  connect(...args) {
    const middleware = new Middleware("connect", ...args);

    this.middlewares.push(middleware);
  }

  options(...args) {
    const middleware = new Middleware("options", ...args);

    this.middlewares.push(middleware);
  }

  trace(...args) {
    const middleware = new Middleware("trace", ...args);

    this.middlewares.push(middleware);
  }

  patch(...args) {
    const middleware = new Middleware("patch", ...args);

    this.middlewares.push(middleware);
  }

  static(path, dir) {
    const tmpPath = `${path !== "/" ? path : ""}/:empty*:`;

    const middleware = staticMiddleware(path, dir);

    this.use(tmpPath, middleware);
  }

  start(port) {
    return new Promise((resolve, reject) => {
      const server = http.createServer(requestHandler(this));

      server.on("error", (error) => reject(error));

      server.listen(port, resolve);
    });
  }
}

module.exports = Server;
