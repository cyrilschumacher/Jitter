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

/**
 * Interface for component state.
 * @interface
 */
interface IAppComponentState {
  hasFiles: boolean;
}

/**
 * Interface for component state.
 * @interface
 */
interface IDragComponentState {
  isDragged: boolean;
}

/**
 * Interface for component properties.
 * @interface
 */
interface IDragComponentProps {
  addFile: any;
}

/**
 * App component.
 * @class
 * @extends React.Component
 */
export default class App extends React.Component<Object, IAppComponentState> {  /**
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
    this.state = {
      hasFiles: false,
      isDragged: false
    };
  };

  /**
   * Add file.
   * @private
   * @param {any}   file  The file.
   * @param {Array} files The files.
   */
  private _addFile = (file: any, files: Array): void => {
    this.setState({hasFiles: true});
    this.refs["gridComponent"].addFile(file, files);
  };

  /**
   * Open browse.
   */
  public browse = (): void => {
    const browseElement: HTMLInputElement = document.getElementById("browse");
    browseElement.click();

    const files = browseElement.files;
    this._jsonReader.readFiles(files, result => {
      this._addFile(result, files);
    });
  };

  /**
   * Fired when a dragged element or text selection leaves a valid drop target.
   * @param {DragEvent} e Represents a drag and drop interaction.
   */
  public dragLeave = (e: any): void => {
    e.preventDefault();
    this.setState({isDragged: false});
  };

  /**
   * Fired when an element or text selection is being dragged over a valid drop target.
   * @param {DragEvent} e Represents a drag and drop interaction.
   */
  public dragOver = (e: any): void => {
    e.preventDefault();
    this.setState({isDragged: true});
  };

  /**
   * Fired when an element or text selection is dropped on a valid drop target.
   * @param {DragEvent} e Represents a drag and drop interaction.
   */
  public drop = (e: any): void => {
    e.preventDefault();
    if (e.dataTransfer && (e.dataTransfer.files.length !== 0)) {
      const files = e.dataTransfer.files;
      this._jsonReader.readFiles(files, result => {
        this._addFile(result, files);
      });
    }
  };

  /**
   * Render a ReactElement into the DOM in the supplied container and return a reference to the component.
   * @return {any} The reference to the component.
   */
  public render(): React.ReactElement<{}> {
    let dragClass = classNames({
      "drag": true,
      "drag--over": this.state.isDragged,
      "hidden": this.state.hasFiles
    });

    let gridClass = classNames({
      "hidden": !this.state.hasFiles
    });

    return (
      <div className="app" onDragLeave={this.dragLeave} onDragOver={this.dragOver} onDrop={this.drop}>
        <div className={dragClass}>
          <Drag addFile={this.addFile}/>
          <input className="drag__browse-input" id="browse" type="file" accept=".json" multiple/>
        </div>
        <div className={gridClass}>
          <Grid ref="gridComponent"/>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.body);
