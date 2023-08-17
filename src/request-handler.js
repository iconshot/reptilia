const crossroads = require("crossroads");

const CookieMap = require("./CookieMap/CookieMap");

module.exports = (server) => (request, response) => {
  const middlewares = server.getMiddlewares();

  if (middlewares.length === 0) {
    return;
  }

  const { headers } = request;

  const cookies = new CookieMap(request, response);

  const { searchParams: query } = new URL(request.url, "http://localhost");

  let index = 0;

  let context = {};

  const run = () => {
    if (index >= middlewares.length) {
      return;
    }

    const middleware = middlewares[index];

    const method = middleware.getMethod();
    const path = middleware.getPath();
    const listener = middleware.getListener();

    let shouldRun = true;

    let params = {}; // params will be populated by the router when needed

    // check method

    if (
      method !== null &&
      request.method.toLowerCase() !== method.toLowerCase()
    ) {
      shouldRun = false;
    }

    // check path

    if (path !== null && shouldRun) {
      shouldRun = false;

      const router = crossroads.create();

      router.normalizeFn = crossroads.NORM_AS_OBJECT;

      router.addRoute(path, (obj) => {
        shouldRun = true;

        // filter out crossroads properties

        Object.keys(obj)
          .filter(
            (key) =>
              key !== "request_" &&
              key !== "vals_" &&
              !Number.isInteger(parseInt(key))
          )
          .forEach((key) => {
            params[key] = obj[key];
          });
      });

      const pathname = request.url.split("#")[0].split("?")[0];

      router.parse(pathname);
    }

    if (!shouldRun) {
      next();

      return;
    }

    listener({
      request,
      response,
      context,
      params,
      headers,
      cookies,
      query,
      next,
    });
  };

  const next = (tmpContext = {}) => {
    context = { ...context, ...tmpContext };

    index++;

    run();
  };

  run(); // start execution
};
