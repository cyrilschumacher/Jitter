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
import * as ReactDOM from "react-dom";
import * as classNames from "classnames";

import Drag from "./drag";
import Grid from "./grid";
import Navigation from "./navigation";

import JsonReader from "../service/jsonReader";
import TranslationService from "../service/translation";

import TranslationModel from "../model/translation";
import TranslationFileModel from "../model/translationFile";
import TranslationItemModel from "../model/translationItem";

/**
 * Interface for component state.
 * @interface
 */
interface IAppComponentState {
  files?: Array<TranslationFileModel>;
  isDragged?: boolean;
  translation?: TranslationModel;
}

/**
 * Interface for component properties.
 * @interface
 */
interface IDragComponentProps {
}

/**
 * Application component.
 * @class
 * @extends React.Component
 */
export default class Application extends React.Component<IDragComponentProps, IAppComponentState> {
  /**
   * JSON reader.
   * @private
   */
  private _jsonReader: JsonReader;

  /**
   * Translation service.
   * @private
   */
  private _translationService: TranslationService;

  /**
   * Constructor.
   * @constructor
   * @param {Object} props The properties.
   */
  constructor(props: Object) {
    super(props);

    this._jsonReader = new JsonReader();
    this._translationService = new TranslationService();
    this.state = { files: [] };
  };

  /**
   * Render a ReactElement into the DOM in the supplied container and return a reference to the component.
   * @return {any} The reference to the component.
   */
  public render(): React.ReactElement<{}> {
    const dragClass = classNames({
      "drag": true,
      "drag--over": this.state.isDragged,
      "hidden": this.state.files.length > 0
    });

    const gridClass = classNames({
      "grid": true,
      "hidden": this.state.files.length === 0
    });

    return (
      <div className="application" onDragLeave={this._dragLeave} onDragOver={this._dragOver} onDrop={this._drop}>
        <Navigation/>
        <div className={dragClass}>
          <Drag addFile={this._addFile} browse={this._browse}/>
        </div>
        <div className={gridClass}>
          <Grid files={this.state.files}
                translation={this.state.translation}
                addKey={this._addKey}
                removeFile={this._removeFile}
                removeCategory={this._removeCategory}
                removeKey={this._removeKey}
                updateCategoryName={this._updateCategoryName}
                updateKey={this._updateKey}
                updateValue={this._updateValue}/>
        </div>
      </div>
    );
  }

  /**
   * Add file.
   * @private
   * @param {any}       file  The file.
   * @param {FileList}  files The files.
   */
  private _addFile = (file: TranslationFileModel, files: FileList): void => {
      const matches = _.some(this.state.files, item => item.name === file.name);
      if (!matches) {
        this.state.translation = this._translationService.parse(file, this.state.translation);
        this.state.files.push(file);

        this.setState({isDragged: this.state.isDragged});
      }
  };

  /**
   * Adds key in category.
   * @private
   * @param {TranslationModel} category The category.
   * @param {string}           key      The key.
   */
  private _addKey = (category: TranslationModel): void => {
    this._translationService.addKey(category, this.state.files);
    this.setState({translation: this.state.translation});
  };

  /**
   * Open browse.
   * @private
   */
  private _browse = (): void => {
    const browseElement = document.getElementById("browse") as HTMLInputElement;
    browseElement.click();

    browseElement.onchange = this._browseOnChange;
  };

  private _browseOnChange = (): void => {
    const browseElement = document.getElementById("browse") as HTMLInputElement;
    const files = browseElement.files;

    this._jsonReader.readFiles(files, result => this._addFile(result, files));
  };

  /**
   * Fired when a dragged element or text selection leaves a valid drop target.
   * @private
   * @param {DragEvent} e Represents a drag and drop interaction.
   */
  private _dragLeave = (e: any): void => {
    e.preventDefault();
    this.setState({isDragged: false});
  };

  /**
   * Fired when an element or text selection is being dragged over a valid drop target.
   * @private
   * @param {DragEvent} e Represents a drag and drop interaction.
   */
  private _dragOver = (e: DragEvent): void => {
    e.preventDefault();
    this.setState({isDragged: true});
  };

  /**
   * Fired when an element or text selection is dropped on a valid drop target.
   * @private
   * @param {DragEvent} e Represents a drag and drop interaction.
   */
  private _drop = (e: DragEvent): void => {
    e.preventDefault();

    if (e.dataTransfer && (e.dataTransfer.files.length !== 0)) {
      const files = e.dataTransfer.files;
      this._jsonReader.readFiles(files, result => this._addFile(result, files));
    }
  };

  /**
   * Remove category.
   * @private
   * @param {Array<TranslationModel>} categories  The categories.
   * @param {TranslationModel}        category    The category to remove.
   */
  private _removeCategory = (categories: Array<TranslationModel>, category: TranslationModel): void => {
    _.remove(categories, item => item.id === category.id);
    this.setState({translation: this.state.translation});
  };

  /**
   * Remove key.
   * @private
   * @param {TranslationModel}      categorie   The category.
   * @param {TranslationItemModel}  item        The item to remove.
   */
  private _removeKey = (items: Array<TranslationItemModel>, item: TranslationItemModel): void => {
    _.remove(items, x => x.id === item.id);
    this.setState({translation: this.state.translation});
  };

  /**
   * Removes file.
   * @private
   * @param {TranslationFileModel} file The file to remove.
   */
  private _removeFile = (file: TranslationFileModel): void => {
    if (this.state.files.length > 1) {
      _.remove(this.state.files, item => item.uuid === file.uuid);
      this._translationService.removeFile(this.state.translation, file.name);
    } else {
      this.state.translation = undefined;
      this.state.files = [];
    }

    this.setState({files: this.state.files, translation: this.state.translation});
  };

  /**
   * Updates a category name.
   * @private
   * @param {TranslationModel}  category  The category.
   * @param {string}            newName   The new name.
   */
  private _updateCategoryName = (category: TranslationModel, newName): void => {
    category.name = newName;
    this.setState({translation: this.state.translation});
  };

  /**
   * Updates a key.
   * @private
   * @param {TranslationItemModel}  item    The item.
   * @param {string}                newKey  The new key.
   */
  private _updateKey = (item: TranslationItemModel, newKey: string): void => {
    item.key = newKey;
    this.setState({translation: this.state.translation});
  };

  /**
   * Updates a value.
   * @private
   * @param {TranslationItemModel}  item      The item.
   * @param {string}                fileName  The file name.
   * @param {string}                newValue  The new value.
   */
  private _updateValue = (item: TranslationItemModel, fileName: string, newValue: string): void => {
    item[fileName] = newValue;
    this.setState({translation: this.state.translation});
  };
}
