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
import TranslationFileModel from "../model/translationFile";
import TranslationItemModel from "../model/translationItem";

export default class TranslationService {
  /**
   * Adds a new key.
   * @param key         The key nam.
   * @param files       The files.
   * @param translation The translation.
   * @return The translation.
   */
  public addKey = (key: string, files: Array<TranslationFileModel>, translation: TranslationModel): TranslationModel => {
    let newItem = new TranslationItemModel(key, new Array());
    _.forEach(files, file => {
      newItem.values[file.name] = "";
    });

    translation.items.push(newItem);
    return translation;
  };

  /**
   * Gets the JSON data by model.
   * @param translation   The translation.
   * @param fileName      The file name.
   * @return The JSON data.
   */
  public getJSON = (translation: TranslationModel, fileName: string): Object => {
    let json = {};
    this._getJSON(translation, fileName, json);

    return json;
  };

  /**
   * Parse a file.
   * @param translation The translation.
   * @param file        The file to parse.
   * @param defaultName The default category name.
   * @return The new translation.
   */
  public parse = (file: TranslationFileModel, translation?: TranslationModel, defaultName?: string): TranslationModel => {
    defaultName = defaultName || "Default";

    translation = this._createTranslation(defaultName, translation);
    return this._parse(file.content, translation, file.name);
  };

  /**
   * Remove a file in translation.
   * @param translation The translation.
   * @param file        The file to parse.
   */
  public removeFile = (translation: TranslationModel, fileName: string): void => {
    translation.items.forEach(item => this._removeFile(item, fileName));
    translation.categories.forEach(category => this.removeFile(category, fileName));
  };

  /**
   * Create a translation.
   * @private
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
   * Gets the JSON data by model.
   * @private
   * @param fileName      The file name.
   * @param translation   The translation.
   * @param json          The JSON object.
   */
  private _getJSON = (translation: TranslationModel, fileName: string, json: Object): void => {
    _.forEach(translation.items, item => {
      const value = item.values[fileName];
      json[item.key] = value;
    });

    _.forEach(translation.categories, category => {
      json[category.name] = {};
      this._getJSON(category, fileName, json[category.name]);
    });
  };

  /**
   * Parse key in file.
   * @param translation The translation.
   * @param fileName    The file name.
   */
  private _parseKey = (items: Array<TranslationItemModel>, fileName: string, key: string, value: string): void => {
    let matches = _.some(items, item => item.key === key);
    if (!matches) {
      items.push(new TranslationItemModel(key, new Array()));
    }

    let translationKey = _.filter(items, item => item.key === key);
    translationKey[0].values[fileName] = value;
  };

  /**
   * Parse category in file.
   * @param translation The translation.
   * @param key         The key.
   * @return The category.
   */
  private _getExistingCategory = (translation: TranslationModel, key: string): TranslationModel => {
    const matches = _.some(translation.categories, category => category.name === key);
    if (!matches) {
      translation.categories.push(new TranslationModel(key));
    }

    return _.find(translation.categories, category => category.name === key);
  };

  /**
   * Parse a file.
   * @private
   * @param json        The JSON data.
   * @param translation The translation.
   * @param fileName    The file name.
   * @return The translation.
   */
  private _parse = (json: Object, translation: TranslationModel, fileName: string): TranslationModel => {
    _.forEach(json, (value, key) => {
      if (typeof (value) === "string") {
        this._parseKey(translation.items, fileName, key, <string> value);
      } else {
        const category = this._getExistingCategory(translation, key);
        this._parse(value, category, fileName);
      }
    });

    return translation;
  };

  /**
   * Remove file in translation item.
   * @private
   * @param item      The translation item.
   * @param fileName  The file name to remove.
   */
  private _removeFile = (item: TranslationItemModel, fileName: string): void => {
    delete item.values[fileName];
  };
}
