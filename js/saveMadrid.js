import * as configuration from "./configuration/configurationModel.js";
import * as openSkyDataSaver from "./openSkyDataSaver.js";

configuration.setMerConfig(40.0234170,40.7441446,-4.2041338,-3.2538165);
configuration.setFlightLocalFolder('C:\\Users\\djpra\\Documentos\\workspaceTFG\\AFrameTest\\flightData_madrid2\\');
configuration.setApiUsuer('vjtemprano');
configuration.setApiPassword('82646858');
configuration.setDaoInterval(5100);
openSkyDataSaver.main();