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

import * as fs from "fs";
import * as React from "react";
import {remote} from "electron";

import TranslationModel from "../model/translation";
import TranslationItemModel from "../model/translationItem";
import TranslationFileModel from "../model/translationFile";
import TranslationService from "../service/translation";

/**
 * Interface for component state.
 * @interface
 */
interface IGridComponentState {
}

/**
 * Interface for component properties.
 * @interface
 */
interface IGridComponentProps {
  addKey?: (category: TranslationModel, key: string) => void;
  files?: Array<TranslationFileModel>;
  translation?: TranslationModel;
  removeFile?: (file: TranslationFileModel) => void;
  removeCategory?: (categories: Array<TranslationModel>, category: TranslationModel) => void;
  removeKey?: (category: TranslationModel, item: TranslationItemModel) => void;
  updateCategoryName?: (category: TranslationModel, newName) => void;
  updateKey?: (item: TranslationItemModel, newKey: string) => void;
  updateValue?: (item: TranslationItemModel, fileName: string, newValue: string) => void;
}

/**
 * Grid component.
 * @class
 * @extends React.Component
 */
export default class Grid extends React.Component<IGridComponentProps, IGridComponentState> {
  /**
   * Default properties.
   * @static
   */
  public static defaultProps: Object = {files: []};

  /**
   * Translation service.
   * @private
   */
  private _translationService: TranslationService;

  /**
   * Constructor.
   * @constructor
   * @param {IGridComponentProps} props The properties.
   */
  constructor(props: IGridComponentProps) {
    super(props);
    this._translationService = new TranslationService();
    this.state = {};
  };

  /**
   * Render a ReactElement into the DOM in the supplied container and return a reference to the component.
   * @return {any} The reference to the component.
   */
  public render(): React.ReactElement<any> {
    let body;
    let fileHeader;

    if (this.props.translation) {
      fileHeader = this._createFileHeader();
      body = this._createBody();
    }

    return (
      <div className="grid">
        <table>
          <thead>
            <tr>
              <th className="grid__head__file"></th>{fileHeader}
            </tr>
          </thead>
          <tbody>{body}</tbody>
        </table>
      </div>
    );
  };

  /**
   * Closes a file.
   * @private
   * @param uuid The UUID.
   */
  private _closeFile = (file: TranslationFileModel): void => {
    const options = {
      buttons: ["Yes", "No"],
      message: "Do you want to save your file before closing?",
      title: "Unsaved Changes",
      type: "question"
    };
    remote.dialog.showMessageBox(null, options, response => {
      if (!response) {
        this._saveFile(file);
      }

      this.props.removeFile(file);
    });
  };

  private _createDOMForElements = (items: Array<TranslationItemModel>): Array<JSX.Element> => {
    return items.map((item, itemIndex) => {
      let elements = new Array<JSX.Element>();
      const keyValueLink = this._createValueLink(this.props.updateKey.bind(null, item), item.key);
      elements.push(
        <td>
          <div className="grid__body__item__key">
            <button onClick={this.props.removeKey.bind(null, items, item)}>
              <i className="ion-close-circled"></i>
            </button>
            <input type="text" valueLink={keyValueLink}/>
          </div>
        </td>
      );

      for (let file of this.props.files) {
        const valueValueLink = this._createValueLink(this.props.updateValue.bind(null, item.values, file.name), item.values[file.name]);
        elements.push(
          <td>
            <input type="text" valueLink={valueValueLink}/>
          </td>
        );
      }

      return <tr className="grid__body__item">{elements}</tr>;
    });
  };

  private _createDOMForTranslation = (translation: TranslationModel, elements?: Array<JSX.Element>): Array<JSX.Element> => {
    if (!elements) {
      elements = new Array<JSX.Element>();
    }

    this._createDOMForElements(translation.items).forEach(value => elements.push(value));

    translation.categories.map(category => {
      const colSpan = this.props.files.length + 1;
      const categoryNameValueLink = this._createValueLink(this.props.updateCategoryName.bind(null, category), category.name);
      elements.push(
        <tr>
          <td colSpan={colSpan}>
            <div className="grid__body__category">
              <button className="grid__body__category__add" onClick={this.props.addKey.bind(null, category)}>
                <i className="ion-plus-circled"></i>
              </button>
              <button className="grid__body__category__remove" onClick={this.props.removeCategory.bind(null, translation.categories, category)}>
                <i className="ion-close-circled"></i>
              </button>
              <input type="text" valueLink={categoryNameValueLink}/>
            </div>
          </td>
        </tr>
      );
      elements.concat(this._createDOMForTranslation(category, elements));
    });

    return elements;
  };

  /**
   * Creates a body.
   * @private
   * @return The render.
   */
  private _createBody = (): any => {
    return this._createDOMForTranslation(this.props.translation);
  };

  /**
   * Creates a header.
   * @private
   * @return The render.
   */
  private _createFileHeader = (): any => {
    return this.props.files.map(file => {
      let closeHandler = this._closeFile.bind(this, file);
      let saveHandler = this._saveFile.bind(this, file);
      return (
        <th className="grid__head__file">
          <span>{file.name}</span>
          <button className="grid__head__file__close" onClick={closeHandler}>
            <i className="ion-ios-close"></i>
          </button>
          <button className="grid__head__action__save" onClick={saveHandler}>
            <i className="ion-ios-checkmark"></i>
          </button>
        </th>
      );
    });
  };

  /**
   * Creates a value link.
   * @private
   * @param requestChange   The update function.
   * @param value           The new value.
   * @return The value link.
   */
  private _createValueLink = (requestChange: Function, value: string): Object => {
    return { requestChange: requestChange, value: value };
  };

  /**
   * Save the translation file.
   * @private
   * @param file      The file name.
   * @param callback  The callback. This parameter is optional.
   */
  private _saveFile = (file: TranslationFileModel, callback?: Function): void => {
    const value = this._translationService.getJSON(this.props.translation, file.name);
    const json = JSON.stringify(value);

    const options = { filters: [
      {  extensions: ["json"], name: "Translation file" }
    ]};

    remote.dialog.showSaveDialog(null, options, fileName => {
      if (fileName) {
        fs.writeFile(fileName, json);
      }
      if (callback) {
        callback();
      }
    });
  };
}
