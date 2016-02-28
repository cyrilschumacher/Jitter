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

import * as _ from "lodash";
import TranslationModel from "../model/translation";
import TranslationItemModel from "../model/translationItem";

export default class TranslationService {
  /**
   * Creates default key by files.
   * @param translation The translation.
   * @param files       The files.
   * @return The updated translation.
   */
  private _createDefaultKeyByFiles = (translation: TranslationModel, files: Array): TranslationModel => {
    for (let index in translation.items) {
      for (let file of files) {
        let value = translation.items[index].values[file.name];
        if (!value) {
          translation.items[index].values[file.name] = "";
        }
      }
    }

    return translation;
  };

  /**
   * Create a translation.
   * @param categoryName  The category name.
   * @param translation   The model.
   */
  private _createTranslation = (categoryName: string, translation: TranslationModel): TranslationModel => {
    if (!translation) {
      return new TranslationModel(categoryName);
    }

    return translation;
  };

  /**
   * Parse a file.
   * @param file        The file to parse.
   * @param files       The files.
   * @param translation The translation.
   */
  public parse = (file: Object, files: Array, translation: TranslationModel): TranslationModel => {
    translation = this._createTranslation("Default", translation);

    for (let key in file.content) {
      const value = file.content[key];

      if (typeof(value) === "string") {
        let exists = _.filter(translation.items, item => item.key === key);
        if (exists.length === 0) {
          translation.items.push(new TranslationItemModel(key, new Array()));
        }

        let translationKey = _.filter(translation.items, item => item.key === key);
        translationKey[0].values[file.name] = value;
      }
    }

    translation = this._createDefaultKeyByFiles(translation, files);
    return translation;
  };

  /**
   * Remove a file in translation.
   * @param file        The file to parse.
   * @param translation The translation.
   */
  public removeFile = (fileName: string, translation: TranslationModel): TranslationModel => {
    for (let index in translation.items) {
      delete translation.items[index].values[fileName];
    }

    return translation;
  };

  public getJSON = (fileName: string, translation: TranslationModel): string => {
    let json = {};
    for (const index in translation.items) {
      const item = translation.items[index];
      const value = item.values[fileName];
      json[item.key] = value;
    }

    return JSON.stringify(json);
  };
}
