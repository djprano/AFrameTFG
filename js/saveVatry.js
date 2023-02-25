import * as OpenSkyModel from "./configuration/openSkyModel.js";
import * as openSky from "./saveApiOpenSky.js";

OpenSkyModel.setMerConfig(48.491151723988,49.027963936994,3.7545776367187,4.6238708496094);
openSky.setUser('vjtemprano');
openSky.setPassword('82646858');
openSky.setSaveFolder('_vatry');
openSky.main();