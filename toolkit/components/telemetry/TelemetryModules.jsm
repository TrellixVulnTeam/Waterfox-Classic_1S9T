/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetter(this, "Preferences",
  "resource://gre/modules/Preferences.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "Log",
  "resource://gre/modules/Log.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "TelemetryController",
  "resource://gre/modules/TelemetryController.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "AppConstants",
  "resource://gre/modules/AppConstants.jsm");

XPCOMUtils.defineLazyServiceGetter(this, "gUpdateTimerManager",
  "@mozilla.org/updates/timer-manager;1", "nsIUpdateTimerManager");
XPCOMUtils.defineLazyServiceGetter(this, "Telemetry",
  "@mozilla.org/base/telemetry;1", "nsITelemetry");

this.EXPORTED_SYMBOLS = [
  "TelemetryModules",
];

const LOGGER_NAME = "Toolkit.Telemetry";
const LOGGER_PREFIX = "TelemetryModules::";

// The default is 1 week.
const MODULES_PING_INTERVAL_SECONDS = 7 * 24 * 60 * 60;
const MODULES_PING_INTERVAL_PREFERENCE = "toolkit.telemetry.modulesPing.interval";

const MAX_MODULES_NUM = 512;
const MAX_NAME_LENGTH = 64;
const TRUNCATION_DELIMITER = "\u2026";

this.TelemetryModules = Object.freeze({
  _log: Log.repository.getLoggerWithMessagePrefix(LOGGER_NAME, LOGGER_PREFIX),

  start() {
    // The list of loaded modules is obtainable only when the profiler is enabled.
    // If it isn't, we don't want to send the ping at all.
    // if (!AppConstants.MOZ_GECKO_PROFILER) {
      return;
    // }

    // // Use nsIUpdateTimerManager for a long-duration timer that survives across sessions.
    // gUpdateTimerManager.registerTimer(
    //   "telemetry_modules_ping",
    //   this,
    //   Preferences.get(MODULES_PING_INTERVAL_PREFERENCE, MODULES_PING_INTERVAL_SECONDS)
    // );
  },

  /**
   * Called when the 'telemetry_modules_ping' timer fires.
   */
  notify() {
    try {
      Telemetry.getLoadedModules().then(
        modules => {
          modules = modules.filter(module => module.name.length > 0);

          // Cut the list of modules to MAX_MODULES_NUM entries.
          if (modules.length > MAX_MODULES_NUM) {
            modules = modules.slice(0, MAX_MODULES_NUM);
          }

          // Cut the file names of the modules to MAX_NAME_LENGTH characters.
          for (let module of modules) {
            if (module.name.length > MAX_NAME_LENGTH) {
              module.name = module.name.substr(0, MAX_NAME_LENGTH - 1) + TRUNCATION_DELIMITER;
            }

            if (module.debugName !== null && module.debugName.length > MAX_NAME_LENGTH) {
              module.debugName = module.debugName.substr(0, MAX_NAME_LENGTH - 1) + TRUNCATION_DELIMITER;
            }
          }

          TelemetryController.submitExternalPing("modules",
            {
              version: 1,
              modules,
            },
            {
              addClientId: true,
              addEnvironment: true,
            }
          );
        },
        err => this._log.error("notify - promise failed", err)
      );
    } catch (ex) {
      this._log.error("notify - caught exception", ex);
    }
  },
});
