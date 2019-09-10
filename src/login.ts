import * as core from '@actions/core';
import * as io from '@actions/io';
import { issueCommand } from '@actions/core/lib/command';
import * as path from 'path';
import * as fs from 'fs';

async function run() {
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
    }

    const runnerTempDirectory = process.env['RUNNER_TEMP']; // Using process.env until the core libs are updated
    const dirPath = path.join(runnerTempDirectory, `docker_login_${Date.now()}`);
    await io.mkdirP(dirPath);
    const dockerConfigPath = path.join(dirPath, `config.json`);
    core.debug(`Writing docker config contents to ${dockerConfigPath}`);
    fs.writeFileSync(dockerConfigPath, JSON.stringify(config));
    issueCommand('set-env', { name: 'DOCKER_CONFIG' }, dirPath);
    console.log('DOCKER_CONFIG environment variable is set');
}

run().catch(core.setFailed);