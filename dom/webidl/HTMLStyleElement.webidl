/* -*- Mode: IDL; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * The origin of this IDL file is
 * http://www.whatwg.org/specs/web-apps/current-work/#the-style-element
 * http://www.whatwg.org/specs/web-apps/current-work/#other-elements,-attributes-and-apis
 */

[HTMLConstructor]
interface HTMLStyleElement : HTMLElement {
           [Pure]
           attribute boolean disabled;
           [CEReactions, SetterThrows, Pure]
           attribute DOMString media;
           [CEReactions, SetterThrows, Pure]
           attribute DOMString nonce;
           [CEReactions, SetterThrows, Pure]
           attribute DOMString type;
           [SetterThrows, Pure, Pref="layout.css.scoped-style.enabled"]
           attribute boolean scoped;
};
HTMLStyleElement implements LinkStyle;

