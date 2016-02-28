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

import * as React from "react";
import * as LinkedStateMixin from "react-addons-linked-state-mixin";
import * as remote from "remote";
import * as fs from "fs";
import TranslationModel from "../model/translation";
import TranslationItemModel from "../model/translationItem";
import TranslationFileModel from "../model/translationFile";
import TranslationService from "../service/translation";

/**
 * Interface for component state.
 * @interface
 */
interface IGridComponentState {
  newKey: string;
  translation: TranslationModel;
  values: TranslationItemModel[];
}

/**
 * Interface for component properties.
 * @interface
 */
interface IGridComponentProps {
  files: Array<TranslationFileModel>;
}

/**
 * Grid component.
 * @class
 * @extends React.Component
 */
export default class Grid extends React.Component<IGridComponentProps, IGridComponentState> {
  /**
   * Translation service.
   * @private
   */
  private _translationService: TranslationService;

  /**
   * Default properties.
   * @static
   */
  public static defaultProps: Object = {files: []};

  /**
   * Constructor.
   * @constructor
   * @param {IGridComponentProps} props The properties.
   */
  constructor(props: IGridComponentProps) {
    super(props);
    this._translationService = new TranslationService();
    this.state = {newKey: "", translation: null, values: null};
  };

  /**
   * Add a new key.
   * @private
   */
  public _addKey = (): void => {
    this.state.translation = this._translationService.addKey(this.state.newKey, this.props.files, this.state.translation);
    this.setState({newKey: "", values: this.state.translation.items, translation: this.state.translation});
    this.forceUpdate();
  };

  /**
   * Creates a body.
   * @private
   * @return The render.
   */
  private _createBody = (): any => {
    return this.state.translation.items.map((item, itemIndex) => {
      let line = [];
      let typeItemLink = {
        requestChange: this._updateKey.bind(null, itemIndex),
        value: item.key
      };
      line.push(<td><input className="grid__body__key" type="text" valueLink={typeItemLink}/></td>);
      for (let file of this.props.files) {
        let typeValueLink = {
          requestChange: this._updateValue.bind(null, itemIndex, file.name),
          value: item.values[file.name]
        };
        line.push(<td><input className="grid__body__value" type="text" valueLink={typeValueLink}/></td>);
      }

      return (
        <tr class="grid__body">{line}</tr>
      );
    });
  };

  /**
   * Creates a header.
   * @private
   * @return The render.
   */
  private _createHeader = (): any => {
    let _grid = this;
    return this.props.files.map(file => {
      let saveHandler = _grid._saveFile.bind(this, file.name);
      return (
        <th className="grid__header__file">
          <span className="grid__header__file__name">{file.name}</span>
          <div className="grid__header__file__action">
            <button className="grid__header__file__action__save" onClick={saveHandler}>
              <i className="ion-ios-download-outline"></i>
            </button>
          </div>
        </th>
      );
    });
  };

  /**
   * Save the translation file.
   * @private
   * @param fileName The file name.
   */
  private _saveFile = (fileName: string): void => {
    const json = this._translationService.getJSON(fileName, this.state.translation);

    const dialog = remote.require("dialog");
    const options = { filters: [
      { name: "Translation file", extensions: ["json"] }
    ]};

    dialog.showSaveDialog(options, fileName => {
      if (fileName) {
        fs.writeFile(fileName, json);
      }
    });
  };

  /**
   * Updates a key.
   * @private
   * @param index The item index.
   * @param value The new value.
   */
  private _updateKey = (index, value): void => {
    this.state.translation.items[index].key = value;
    this.setState({newKey: "", values: this.state.translation.items, translation: this.state.translation});
  };

  /**
   * Updates a value.
   * @private
   * @param itemIndex   The item index.
   * @param valueIndex  The value index.
   * @param value       The new value.
   */
  private _updateValue = (itemIndex, fileName, value): void => {
    this.state.translation.items[itemIndex].values[fileName] = value;
    this.setState({newKey: "", values: this.state.translation.items, translation: this.state.translation});
  };

  /**
   * Updates a new key.
   * @private
   * @param value       The new value.
   */
  private _updateNewKey = (value): void => {
    this.setState({newKey: value, values: this.state.translation.items, translation: this.state.translation});
  };

  /**
   * Adds a translation file.
   * @param {Object}  file  The file.
   * @param {Array}   files The files.
   */
  public addFile = (file: TranslationFileModel, files: Array<File>): void => {
      const exists = _.filter(this.props.files, item => item.name === file.name);
      if (exists.length === 0) {
        this.props.files.push(file);
        this.state.translation = this._translationService.parse(file, this.props.files, this.state.translation);
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
  }
}
