const crossroads = require("crossroads");

const BodyHelper = require("./helpers/BodyHelper");

const Controller = require("./Controller/Controller");

module.exports = (server) => async (request, response) => {
  const end = () => response.end();

  const middlewares = server.getMiddlewares();

  if (middlewares.length === 0) {
    end();

    return;
  }

  const { headers } = request;

  const body = await BodyHelper.parseBody(request);

  const controller = new Controller(request, response);

  const cookies = controller.parseCookies();

  const { pathname, searchParams } = new URL(request.url, "http://localhost");

  const query = {};

  searchParams.forEach((value, key) => {
    query[key] = value;
  });

  let index = 0;

  let context = {};

  const run = () => {
    if (index >= middlewares.length) {
      end();

      return;
    }

    const middleware = middlewares[index];

    const method = middleware.getMethod();
    const path = middleware.getPath();
    const listener = middleware.getListener();

    let shouldRun = true;

    let params = {}; // params will be populated by the router when needed

    // check method

    if (method !== null && method.toUpperCase() !== request.method) {
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

      router.parse(pathname);
    }

    if (!shouldRun) {
      next();

      return;
    }

    listener({
      request,
      response,
      controller,
      headers,
      body,
      cookies,
      query,
      context,
      params,
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
