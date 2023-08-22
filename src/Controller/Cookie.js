class Cookie {
  constructor(name, value, options = {}) {
    this.name = name;
    this.value = value;
    this.options = options;
  }

  getName() {
    return this.name;
  }

  getValue() {
    return this.value;
  }

  getOptions() {
    return this.options;
  }
}

module.exports = Cookie;
