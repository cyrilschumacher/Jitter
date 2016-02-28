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
import { translate } from "react-i18next";

/**
 * Drag component.
 * @class
 * @extends React.Component
 */
class Drag extends React.Component<any, any> {
  /**
   * Constructor.
   * @constructor
   * @param props The properties.
   */
  constructor(props: any) {
    super(props);
  };

  /**
   * Render a ReactElement into the DOM in the supplied container and return a reference to the component.
   * @return The reference to the component.
   */
  public render(): React.ReactElement<any> {
    const t = this.props.t;
    return (
      <div className="drag__container">
        <img className="drag__container__logo" src="asset/image/file_icon.png"/>
        <h1 className="drag__container__title">{t("drag.title")}</h1>
        <span className="drag__container__subtitle">
          <span>{t("drag.subtitle")}</span>
          <a className="drag__container__subtitle__browse" onClick={this.props.browse}>{t("drag.browse")}</a>.
        </span>
        <input className="drag__browse-input" id="browse" type="file" accept=".json" multiple/>
      </div>
    );
  }
}

export default translate(["translation"])(Drag);
