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
import * as Modal from "react-modal";

/**
 * Interface for component properties.
 * @interface
 */
interface ISettingsComponentProps {
  /**
   * Closes the modal.
   */
  close: () => void;

  /**
   * Opens the modal.
   */
  isOpen: boolean;
}

/**
 * Navigation component.
 * @class
 * @extends React.Component
 */
class Settings extends React.Component<ISettingsComponentProps, any> {
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
    return (
        <Modal className="modal__settings" isOpen={this.props.isOpen}>
          <header className="modal__settings__header">
            <button className="modal__settings__header__close" onClick={this.props.close}>
              <span className="ion-close"></span>
            </button>
            <h1>{this.props.t("modal.settings.title")}</h1>
          </header>
          <section>
            <form className="modal__settings__form">
              <p>
                <label className="modal__settings__form__label" for="indent">
                  <span className="modal__settings__form__label__title">{this.props.t("modal.settings.form.indent.title")}</span>
                  <span className="modal__settings__form__label__summary">{this.props.t("modal.settings.form.indent.summary")}</span>
                </label>
                <input className="modal__settings__form__indent" id="indent" type="number" min="0" max="10"/>
              </p>
              <p className="modal__settings__form__save">
                <button>{this.props.t("modal.settings.form.save")}</button>
              </p>
            </form>
          </section>
        </Modal>
    );
  }
}

export default translate(["translation"])(Settings);
