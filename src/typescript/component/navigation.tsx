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
import {translate} from "react-i18next";
import SettingsModal from "./modal/settings";

/**
 * Navigation component.
 * @class
 * @extends React.Component
 */
class Navigation extends React.Component<any, any> {
  /**
   * Constructor.
   * @constructor
   * @param props The properties.
   */
  constructor(props: any) {
    super(props);
    this.state = { settingsModalIsOpen: false };
  };

  /**
   * Render a ReactElement into the DOM in the supplied container and return a reference to the component.
   * @return The reference to the component.
   */
  public render(): React.ReactElement<any> {
    return (
      <div className="navigation">
          <SettingsModal isOpen={this.state.settingsModalIsOpen} close={this._closeSettingsModal}/>
          <button onClick={this._openSettingsModal}>
            <span className="ion-gear-a"></span>
          </button>
      </div>
    );
  }

  /**
   * Closes the settings modal.
   */
  private _closeSettingsModal = (): void => {
    this.setState({settingsModalIsOpen: false});
  };

  /**
   * Opens the settings modal.
   */
  private _openSettingsModal = (): void => {
    this.setState({settingsModalIsOpen: true});
  };
}

export default translate(["translation"])(Navigation);
