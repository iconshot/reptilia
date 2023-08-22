class Middleware {
  constructor(method, ...args) {
    let path = null;
    let listener = null;

    switch (args.length) {
      case 1: {
        listener = args[0];

        break;
      }

      case 2: {
        path = args[0];
        listener = args[1];

        break;
      }
    }

    if (typeof listener !== "function") {
      throw new Error("Middleware listener must be a function.");
    }

    this.method = method;
    this.path = path;
    this.listener = listener;
  }

  getMethod() {
    return this.method;
  }

  getPath() {
    return this.path;
  }

  getListener() {
    return this.listener;
  }
}

module.exports = Middleware;
