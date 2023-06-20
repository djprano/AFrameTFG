import * as configuration from "./configuration/configurationModel.js";
import * as openSkyDataSaver from "./openSkyDataSaver.js";

configuration.setMerConfig(48.491151723988,49.027963936994,3.7545776367187,4.6238708496094);
configuration.setFlightLocalFolder('_vatry');
configuration.setApiUsuer('vjtemprano');
configuration.setApiPassword('82646858');
configuration.setDaoInterval(5100);
openSkyDataSaver.main();