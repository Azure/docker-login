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
const core = require("@actions/core");
const io = require("@actions/io");
const command_1 = require("@actions/core/lib/command");
const path = require("path");
const fs = require("fs");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        let username = core.getInput('username', { required: true });
        let password = core.getInput('password', { required: true });
        let loginServer = core.getInput('login-server', { required: true });
        let authenticationToken = new Buffer(`${username}:${password}`).toString('base64');
        let config = {
            "auths": {
                [loginServer]: {
                    auth: authenticationToken
                }
            }
        };
        const runnerTempDirectory = process.env['RUNNER_TEMP']; // Using process.env until the core libs are updated
        const dirPath = path.join(runnerTempDirectory, `docker_login_${Date.now()}`);
        yield io.mkdirP(dirPath);
        const dockerConfigPath = path.join(dirPath, `config.json`);
        core.debug(`Writing docker config contents to ${dockerConfigPath}`);
        fs.writeFileSync(dockerConfigPath, JSON.stringify(config));
        command_1.issueCommand('set-env', { name: 'DOCKER_CONFIG' }, dirPath);
        console.log('DOCKER_CONFIG environment variable is set');
    });
}
run().catch(core.setFailed);
