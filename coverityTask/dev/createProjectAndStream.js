"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var coverityApi = require("../coverity_api_soap");
var server = "http://emmett:1701";
var username = "admin";
var password = "coverity";
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Starting coverity, connecting to:" + server);
            var connected = yield coverityApi.connectAsync(server, username, password);
            if (!connected || !(coverityApi.client)) {
                console.log("Failed to connect.");
                return;
            }
            else {
                console.log("Connected!");
            }
            console.log("Creating project.");
            var detectProject = {
                description: "Detect project for testing.",
                name: "Detect Project",
                roleAssignments: []
            };
            yield coverityApi.createProjectAsync(detectProject);
            console.log("Created project.");
            console.log("Creating Stream.");
            var stream = {
                description: "Development Stream",
                enableDesktopAnalysis: true,
                language: "JAVA",
                name: "Development Stream",
                triageStoreId: [{ name: "Default Triage Store" }],
            };
            yield coverityApi.createStreamAsync(detectProject.name, stream);
            console.log("Created stream.");
            console.log("Finished.");
        }
        catch (err) {
            var text;
            if (err.message) {
                text = err.message;
            }
            else {
                text = err.toString();
            }
            console.log("An error occured.");
            console.log(err);
        }
    });
}
run();
