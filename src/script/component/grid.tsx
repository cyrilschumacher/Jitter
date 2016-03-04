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
  files?: Array<TranslationFileModel>;
  newKey?: string;
  translation?: TranslationModel;
}

/**
 * Interface for component properties.
 * @interface
 */
interface IGridComponentProps {
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
    this.state = {files: [], newKey: ""};
  };

  /**
   * Adds a translation file.
   * @param {Object}  file  The file to add.
   * @param {Array}   files The files.
   */
  public addFile = (file: TranslationFileModel, files: Array<File>): void => {
      const matches = _.some(this.state.files, item => item.name === file.name);
      if (!matches) {
        this.state.files.push(file);
        this.state.translation = this._translationService.parse(this.state.translation, file, this.state.files);
        this.forceUpdate();
      }
  };

  /**
   * Render a ReactElement into the DOM in the supplied container and return a reference to the component.
   * @return {any} The reference to the component.
   */
  public render(): React.ReactElement<any> {
    let header;
    let body;
    let typeItemLink = {requestChange: this._updateNewKey, value: this.state.newKey};

    if (this.state.translation) {
      header = this._createHeader();
      body = this._createBody();
    }

    return (
      <div className="grid">
        <table>
          <thead>
            <tr className="grid__header">
              <th className="grid__header__key">Key</th>
              {header}
            </tr>
          </thead>
          <tbody>{body}</tbody>
        </table>
        <footer className="grid__footer">
          <input className="grid__footer__add-input" valueLink={typeItemLink} type="text"/>
          <button className="grid__footer__add-button" onClick={this._addKey}>
            <i className="ion-ios-plus-outline"></i>
            <span>Add key</span>
          </button>
        </footer>
      </div>
    );
  };

  /**
   * Add a new key.
   * @private
   */
  private _addKey = (): void => {
    if (this.state.newKey !== "") {
      this.state.translation = this._translationService.addKey(this.state.newKey, this.state.files, this.state.translation);
      this.setState({newKey: ""});
      this.forceUpdate();
    }
  };

  private _createDOMForElements = (items: Array<TranslationItemModel>): Array<JSX.Element> => {
    return items.map((item, itemIndex) => {
      let elements = new Array<JSX.Element>();
      const keyValue = {
        requestChange: this._updateKey.bind(null, item),
        value: item.key
      };
      elements.push(<td><input className="grid__body__key" type="text" valueLink={keyValue}/></td>);

      for (let file of this.state.files) {
        const value = {
          requestChange: this._updateValue.bind(null, item.values, file.name),
          value: item.values[file.name]
        };
        elements.push(<td className={file.uuid}><input className="grid__body__value" type="text" valueLink={value}/></td>);
      }

      return <tr class="grid__body">{elements}</tr>;
    });
  };

  private _createDOMForTranslation = (translation: TranslationModel, elements?: Array<JSX.Element>): Array<JSX.Element> => {
    if (!elements) {
      elements = new Array<JSX.Element>();
    }

    this._createDOMForElements(translation.items).forEach(value => elements.push(value));

    translation.categories.map(category => {
      const colSpan = this.state.files.length + 1;
      elements.push(<tr className="grid__body"><td className="grid__body__category" colSpan={colSpan}>{category.name}</td></tr>);
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
    return this._createDOMForTranslation(this.state.translation);
  };

  /**
   * Creates a header.
   * @private
   * @return The render.
   */
  private _createHeader = (): any => {
    let _grid = this;
    return this.state.files.map(file => {
      let saveHandler = _grid._saveFile.bind(this, file.name);
      let closeHandler = _grid._closeFile.bind(this, file.uuid);
      let headerClass = "grid__header__file " + file.uuid;
      return (
        <th className={headerClass}>
          <span className="grid__header__file__name">{file.name}</span>
          <div className="grid__header__file__action">
            <button onClick={saveHandler}>
              <i className="ion-ios-download-outline"></i>
            </button>
          </div>
          <div className="grid__header__file__action">
            <button onClick={closeHandler}>
              <i className="ion-ios-trash-outline"></i>
            </button>
          </div>
        </th>
      );
    });
  };

  /**
   * Closes a file.
   * @private
   * @param uuid The UUID.
   */
  private _closeFile = (uuid: string): void => {
    const options = {
      buttons: ["Yes", "No"],
      message: "Do you want to save your file before closing?",
      title: "Unsaved Changes",
      type: "question"
    };
    remote.dialog.showMessageBox(null, options, response => {
      const file = _.find(this.state.files, item => item.uuid === uuid);
      if (!response) {
        this._saveFile(file.name, () => {
          let elements = document.getElementsByClassName(uuid);
          while (elements.length > 0) {
              elements[0].parentNode.removeChild(elements[0]);
          }
        });
      }

      this._translationService.removeFile(this.state.translation, file.name);
      let elements = document.getElementsByClassName(uuid);
      while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
      }
    });
  };

  /**
   * Save the translation file.
   * @private
   * @param fileName The file name.
   * @param callback The callback. This parameter is optional.
   */
  private _saveFile = (fileName: string, callback?: Function): void => {
    const json = this._translationService.getJSON(this.state.translation, fileName);

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

  /**
   * Updates a key.
   * @private
   * @param index The item index.
   * @param value The new value.
   */
  private _updateKey = (item, value): void => {
    item.key = value;
    this.setState({translation: this.state.translation});
  };

  /**
   * Updates a new key.
   * @private
   * @param value       The new value.
   */
  private _updateNewKey = (value): void => {
    this.setState({newKey: value});
  };

  /**
   * Updates a value.
   * @private
   * @param itemIndex   The item index.
   * @param valueIndex  The value index.
   * @param value       The new value.
   */
  private _updateValue = (item, fileName, value): void => {
    item[fileName] = value;
    this.setState({translation: this.state.translation});
  };
}
