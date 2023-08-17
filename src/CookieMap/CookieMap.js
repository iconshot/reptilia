const _cookie = require("cookie");

const Cookie = require("./Cookie");

class CookieMap {
  constructor(request, response) {
    this.response = response;

    const { cookie = null } = request.headers;

    this.object = cookie !== null ? _cookie.parse(cookie) : {};

    this.list = [];
  }

  get(name) {
    return name in this.object ? this.object[name] : null;
  }

  update() {
    const serialized = this.list.map((cookie) => {
      const name = cookie.getName();
      const value = cookie.getValue();
      const options = cookie.getOptions();

      return _cookie.serialize(name, value, options);
    });

    // multiple cookies are passed through an array

    this.response.setHeader("Set-Cookie", serialized);
  }

  set(name, value, options = {}) {
    // filter is necessary so every cookie name is unique

    this.list = this.list.filter((cookie) => cookie.getName() !== name);

    const cookie = new Cookie(name, value, options);

    this.list.push(cookie);

    this.update();
  }

  delete(name) {
    this.set(name, "", { maxAge: 0 });
  }
}

module.exports = CookieMap;
