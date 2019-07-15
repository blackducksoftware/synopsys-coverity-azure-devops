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
var soap = require("soap");
var urljoin = require('url-join');
var request = require('request');
var coverity_api = {
    connectAsync: function (server, username, password, allowInsecure) {
        return __awaiter(this, void 0, void 0, function () {
            var url, soapClient, options, wsSecurity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = urljoin(server, "/ws/v9/configurationservice?wsdl");
                        if (allowInsecure) {
                            request = request.defaults({
                                strictSSL: false
                            });
                        }
                        return [4 /*yield*/, soap.createClientAsync(url, { 'request': request })];
                    case 1:
                        soapClient = _a.sent();
                        this.client = soapClient;
                        options = {
                            hasNonce: false,
                            digestPassword: false
                        };
                        wsSecurity = new soap.WSSecurity(username, password, options);
                        this.client.setSecurity(wsSecurity);
                        return [2 /*return*/, true];
                }
            });
        });
    },
    findProjectAsync: function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, result, rawResponse, soapheader, rawRequest, projects, project;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.client.getProjectsAsync()];
                    case 1:
                        _a = _b.sent(), result = _a[0], rawResponse = _a[1], soapheader = _a[2], rawRequest = _a[3];
                        projects = result["return"];
                        project = null;
                        projects.forEach(function (element) {
                            if (element.id.name == name) {
                                project = element;
                            }
                        });
                        return [2 /*return*/, project];
                }
            });
        });
    },
    findStreamAsync: function (project, name) {
        return __awaiter(this, void 0, void 0, function () {
            var stream;
            return __generator(this, function (_a) {
                stream = null;
                project.streams.forEach(function (element) {
                    if (element.id.name == name) {
                        stream = element;
                    }
                });
                return [2 /*return*/, stream];
            });
        });
    },
    createProjectAsync: function (project) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.createProjectAsync({ projectSpec: project })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    },
    createStreamAsync: function (projectName, stream) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.createStreamInProjectAsync({ projectId: { name: projectName }, streamSpec: stream })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    },
    client: undefined
};
module.exports = coverity_api;
