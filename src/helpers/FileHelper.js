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

  static async read(file) {
    return await fsp.readFile(file);
  }

  static async isFile(file) {
    const stat = await fsp.stat(file);

    return stat.isFile();
  }

  static async isDirectory(file) {
    const stat = await fsp.stat(file);

    return stat.isDirectory();
  }

  static async getModifiedTime(file) {
    const stat = await fsp.stat(file);

    return stat.mtime;
  }
}

module.exports = FileHelper;
