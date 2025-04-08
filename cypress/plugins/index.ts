const admin = require('firebase-admin');
const cypressFirebasePlugin = require('cypress-firebase').plugin;

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on: any, config: any) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  const extendedConfig = cypressFirebasePlugin(on, config, admin);

  return extendedConfig;
};