const send = require("send");

const _cookie = require("cookie");

const Cookie = require("./Cookie");

class Controller {
  constructor(request, response) {
    this.request = request;
    this.response = response;

    this.cookiesList = [];
  }

  parseCookies() {
    const { cookie = null } = this.request.headers;

    return cookie !== null ? _cookie.parse(cookie) : {};
  }

  updateCookies() {
    const serialized = this.cookiesList.map((cookie) => {
      const name = cookie.getName();
      const value = cookie.getValue();
      const options = cookie.getOptions();

      return _cookie.serialize(name, value, options);
    });

    this.response.setHeader("Set-Cookie", serialized);
  }

  setCookie(name, value, options = {}) {
    // filter is necessary so every cookie name is unique

    this.cookiesList = this.cookiesList.filter(
      (cookie) => cookie.getName() !== name
    );

    const cookie = new Cookie(name, value, options);

    this.cookiesList.push(cookie);

    this.updateCookies();
  }

  deleteCookie(name) {
    this.setCookie(name, "", { maxAge: 0 });
  }

  text(text) {
    this.response.setHeader("Content-Type", "text/plain");

    this.response.end(text);
  }

  html(html) {
    this.response.setHeader("Content-Type", "text/html");

    this.response.end(html);
  }

  json(json) {
    this.response.setHeader("Content-Type", "application/json");

    this.response.end(JSON.stringify(json));
  }

  file(file) {
    send(this.request, file).pipe(this.response);
  }
}

module.exports = Controller;
