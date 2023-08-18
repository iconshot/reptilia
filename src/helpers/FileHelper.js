const fsp = require("fs/promises");

class FileHelper {
  static async exists(file) {
    try {
      await fsp.access(file);

      return true;
    } catch (error) {
      return false;
    }
  }

  static async isFile(file) {
    const stat = await fsp.stat(file);

    return stat.isFile();
  }

  static async isDirectory(file) {
    const stat = await fsp.stat(file);

    return stat.isDirectory();
  }
}

module.exports = FileHelper;
