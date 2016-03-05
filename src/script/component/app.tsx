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
import JsonReader from "../service/jsonReader";
import TranslationFileModel from "../model/translationFile";

/**
 * Interface for component state.
 * @interface
 */
interface IAppComponentState {
  files?: Array<TranslationFileModel>;
  isDragged?: boolean;
}

/**
 * Interface for component properties.
 * @interface
 */
interface IDragComponentProps {
}

/**
 * App component.
 * @class
 * @extends React.Component
 */
export default class App extends React.Component<IDragComponentProps, IAppComponentState> {
  /**
   * Default references.
   * @static
   */
  public refs: {
    [ref: string]: React.Component<any, any>
  };

  /**
   * JSON reader.
   * @private
   */
  private _jsonReader: JsonReader;

  /**
   * Constructor.
   * @constructor
   * @param {Object} props The properties.
   */
  constructor(props: Object) {
    super(props);

    this._jsonReader = new JsonReader();
    this.state = this.getInitialState();
  };

  /**
   * Invoked once before the component is mounted.
   * @return {IAppComponentState} The initial value.
   */
  public getInitialState(): IAppComponentState {
    return { files: [] };
  };

  /**
   * Render a ReactElement into the DOM in the supplied container and return a reference to the component.
   * @return {any} The reference to the component.
   */
  public render(): React.ReactElement<{}> {
    let dragClass = classNames({
      "drag": true,
      "drag--over": this.state.isDragged,
      "hidden": this.state.files.length > 0
    });

    let gridClass = classNames({
      "grid": true,
      "hidden": this.state.files.length === 0
    });

    return (
      <div className="app" onDragLeave={this._dragLeave} onDragOver={this._dragOver} onDrop={this._drop}>
        <div className={dragClass}>
          <Drag addFile={this._addFile} browse={this._browse}/>
        </div>
        <div className={gridClass}>
          <Grid files={this.state.files} removeFile={this._removeFile}/>
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
  private _addFile = (file: any, files: FileList): void => {
      const matches = _.some(this.state.files, item => item.name === file.name);
      if (!matches) {
        this.state.files.push(file);
        this.setState({isDragged: this.state.isDragged});
      }
  };

  /**
   * Open browse.
   * @private
   */
  private _browse = (): void => {
    const browseElement = document.getElementById("browse") as HTMLInputElement;
    browseElement.click();

    const files = browseElement.files;
    this._jsonReader.readFiles(files, result => {
      this._addFile(result, files);
    });
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
  private _drop = (e: any): void => {
    e.preventDefault();
    if (e.dataTransfer && (e.dataTransfer.files.length !== 0)) {
      const files = e.dataTransfer.files;
      this._jsonReader.readFiles(files, result => {
        this._addFile(result, files);
      });
    }
  };

  /**
   * Remove file.
   * @private
   * @param {TranslationFileModel} file The file to delete.
   */
  private _removeFile = (file: TranslationFileModel): void => {
    _.remove(this.state.files, item => item.uuid === file.uuid);
    this.setState({files: this.state.files});
  };
}
