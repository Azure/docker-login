import * as core from '@actions/core';
import * as io from '@actions/io';
import { issueCommand } from '@actions/core/lib/command';
import * as path from 'path';
import * as fs from 'fs';

interface dockerConfig {
    auths?: {[key: string]: {auth: string}}
}

async function run() {
    let username = core.getInput('username', { required: true });
    let password = core.getInput('password', { required: true });
    let loginServer = core.getInput('login-server', { required: true });
    let authenticationToken = Buffer.from(`${username}:${password}`).toString('base64');

    let config: dockerConfig;

    const runnerTempDirectory = process.env['RUNNER_TEMP']; // Using process.env until the core libs are updated
    const dirPath = process.env['DOCKER_CONFIG'] || path.join(runnerTempDirectory, `docker_login_${Date.now()}`);
    await io.mkdirP(dirPath);
    const dockerConfigPath = path.join(dirPath, `config.json`);
    if (fs.existsSync(dockerConfigPath)) {
        try {
            config = JSON.parse(fs.readFileSync(dockerConfigPath, 'utf8'));
            if (!config.auths) {
                config.auths = {};
            }
            config.auths[loginServer] = { auth: authenticationToken };
        } catch (err) {
            // if the file is invalid, just overwrite it
            config = undefined;
        }
    }
    if (!config) {
        config = {
            "auths": {
                [loginServer]: {
                    auth: authenticationToken
                }
            }
        }
    }
    core.debug(`Writing docker config contents to ${dockerConfigPath}`);
    fs.writeFileSync(dockerConfigPath, JSON.stringify(config));
    issueCommand('set-env', { name: 'DOCKER_CONFIG' }, dirPath);
    console.log('DOCKER_CONFIG environment variable is set');
}

run().catch(core.setFailed);
