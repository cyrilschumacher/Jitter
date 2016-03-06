/* The MIT License (MIT)
 *
 * Copyright (c) 2016 Cyril Schumacher.fr
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import TranslateFileModel from "../model/translationFile";

export default class JsonReader {
  /**
   * Reads file.
   * @param {File} file The file to read.
   * @param {Function} callback The callback.
   */
  public readFile = (file: File, callback: Function): void => {
    const name = file.name;
    const reader = new FileReader();
    reader.onloadend = (e: ProgressEvent) => {
      const content = this._parseFileContent((<IDBOpenDBRequest>e.target).result);
      const uuid = this._generateUUID();
      const result = new TranslateFileModel(name, uuid, content);
      callback(result);
    };

    reader.readAsText(file, "utf-8");
  };

  /**
   * Reads many files.
   * @param {FileList} files The files to read.
   * @param {Function} callback The callback.
   */
  public readFiles = (files: FileList, callback: Function): void => {
    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      this.readFile(file, callback);
    }
  };

  /**
   * Generates a UUID.
   * @private
   * @return The UUID.
   */
  private _generateUUID = (): string => {
    let d = new Date().getTime();
    const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return ((c === "x") ? r : (r & 0x3 | 0x8)).toString(16);
    });

    return uuid;
  };

  /**
   * Parse file content.
   * @private
   * @param {string} content The file content.
   * @return {Object} The JSON object.
   */
  private _parseFileContent = (content: string): Object => {
    return JSON.parse(content);
  };
}
