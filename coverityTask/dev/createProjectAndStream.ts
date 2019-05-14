var coverityApi = require("../coverity_api_soap");
import CoverityTypes = require("../coverity_types");

var config = require("../tests/config.json");

async function run() {
    try {

        console.log("Starting coverity, connecting to:" + config.server);

        var connected = await coverityApi.connectAsync(config.server, config.username, config.password);
        if (!connected || !(coverityApi.client)) {
            console.log("Failed to connect.");
            return;
        } else {
            console.log("Connected!");
        }

        console.log("Creating project.");
        var detectProject:CoverityTypes.ProjectSpec = {
            description: "Detect project for testing.",
            name: "Detect Project",
            roleAssignments: []
        };
        await coverityApi.createProjectAsync(detectProject);
        console.log("Created project.");

        console.log("Creating Stream.");
        var stream: CoverityTypes.StreamSpec = {
            description: "Development Stream",
            enableDesktopAnalysis: true,
            language: "JAVA",
            name: "Development Stream",
            triageStoreId:[{name: "Default Triage Store"}],
        }
        await coverityApi.createStreamAsync(detectProject.name, stream);
        console.log("Created stream.");

        console.log("Finished.");
    }
    catch (err) {
        var text;
        if (err.message){
            text = err.message;
        } else {
            text = err.toString();
        }
        console.log("An error occured.");
        console.log(err);
    }
}

run();
