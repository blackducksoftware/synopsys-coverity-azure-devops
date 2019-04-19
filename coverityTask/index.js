"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var tl = require("azure-pipelines-task-lib/task");
var soap = require("soap");
var options = {
    hasNonce: false,
    digestPassword: false
};
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var server, username, password, url, projectName_1, soapClient, client, wsSecurity, _a, result, rawResponse, soapheader, rawRequest, projects, project, inputString, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    server = tl.getEndpointUrl('coverityService', true);
                    console.log(server);
                    username = tl.getEndpointAuthorizationParameter('coverityService', 'username', true);
                    password = tl.getEndpointAuthorizationParameter('coverityService', 'password', true);
                    url = server + "/ws/v9/configurationservice?wsdl";
                    projectName_1 = tl.getInput('projectName', true);
                    return [4 /*yield*/, soap.createClientAsync(url)];
                case 1:
                    soapClient = _b.sent();
                    client = soapClient;
                    wsSecurity = new soap.WSSecurity(username, password, options);
                    client.setSecurity(wsSecurity);
                    return [4 /*yield*/, client.getProjectsAsync()];
                case 2:
                    _a = _b.sent(), result = _a[0], rawResponse = _a[1], soapheader = _a[2], rawRequest = _a[3];
                    projects = result["return"];
                    project = null;
                    projects.forEach(function (element) {
                        if (element.id.name == projectName_1) {
                            project = element;
                        }
                    });
                    if (project == null) {
                        tl.setResult(tl.TaskResult.Failed, 'Given project could not be found on coverity server.');
                        return [2 /*return*/];
                    }
                    console.log(result["return"][0].id);
                    console.log("Finished.");
                    return [2 /*return*/];
                case 3:
                    err_1 = _b.sent();
                    console.log("An error occured.");
                    tl.setResult(tl.TaskResult.Failed, err_1.message);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
run();
