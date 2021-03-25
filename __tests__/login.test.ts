import * as login from '../src/login'
import * as core from '@actions/core';
import * as io from '@actions/io';
import * as fs from 'fs';
import * as path from 'path';

describe('Testing all files in login file.', () => {
    test('run() - create authtoken and make config file if it doesn\'t exist', async () => {
        jest.spyOn(core, 'getInput').mockImplementation((inputName, options) => {
            if (inputName == 'username') return 'sampleUsername';
            if (inputName == 'password') return 'samplePassword';
            if (inputName == 'login-server') return 'sampleServer';
        });
        process.env['RUNNER_TEMP'] = 'tempDirPath';
        process.env['DOCKER_CONFIG'] = '';
        jest.spyOn(io, 'mkdirP').mockImplementation();
        jest.spyOn(fs, 'existsSync').mockReturnValue(false);
        jest.spyOn(fs, 'writeFileSync').mockImplementation();
        jest.spyOn(core, 'exportVariable').mockImplementation();
        jest.spyOn(Date, 'now').mockImplementation(() => 1234561234567);
        jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(core, 'debug').mockImplementation();
    
        expect(await login.run()).toBeUndefined();
        expect(io.mkdirP).toBeCalledWith(path.join('tempDirPath', 'docker_login_1234561234567'));
        const writeContent = JSON.stringify({
            "auths": {
                "sampleServer": {
                    auth: Buffer.from('sampleUsername:samplePassword').toString('base64')
                }
            }
        })
        expect(fs.writeFileSync).toBeCalledWith(path.join('tempDirPath', 'docker_login_1234561234567', 'config.json'), writeContent);
        expect(core.exportVariable).toBeCalledWith('DOCKER_CONFIG', path.join('tempDirPath', 'docker_login_1234561234567'));
    });

    test('run() - create authtoken and append to existing config file', async () => {
        jest.spyOn(core, 'getInput').mockImplementation((inputName, options) => {
            if (inputName == 'username') return 'sampleUsername';
            if (inputName == 'password') return 'samplePassword';
            if (inputName == 'login-server') return 'sampleServer';
        });
        process.env['RUNNER_TEMP'] = 'tempDirPath';
        process.env['DOCKER_CONFIG'] = 'existingConfigDirPath';
        jest.spyOn(io, 'mkdirP').mockImplementation();
        jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        const content = JSON.stringify({
            "auths": {
                "existingServerName": {
                    "auth": "existingServerAuthToken"
                }
            }
        });
        jest.spyOn(fs, 'readFileSync').mockReturnValue(content);
        jest.spyOn(fs, 'writeFileSync').mockImplementation();
        jest.spyOn(core, 'exportVariable').mockImplementation();
        jest.spyOn(Date, 'now').mockImplementation(() => 1234561234567);
        jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(core, 'debug').mockImplementation();
    
        expect(await login.run()).toBeUndefined();
        expect(io.mkdirP).toBeCalledWith('existingConfigDirPath');
        expect(fs.existsSync).toBeCalledWith(path.join('existingConfigDirPath', 'config.json'));
        expect(fs.readFileSync).toBeCalledWith(path.join('existingConfigDirPath', 'config.json'), 'utf8');
        const writeContent = JSON.stringify({
            "auths": {
                "existingServerName": {
                    auth: "existingServerAuthToken"
                },
                "sampleServer": {
                    auth: Buffer.from('sampleUsername:samplePassword').toString('base64')
                }
            }
        })
        expect(fs.writeFileSync).toBeCalledWith(path.join('existingConfigDirPath', 'config.json'), writeContent);
        expect(core.exportVariable).toBeCalledWith('DOCKER_CONFIG', 'existingConfigDirPath');
    });

    test('run() - overwrite existing config file if unable to parse', async () => {
        jest.spyOn(core, 'getInput').mockImplementation((inputName, options) => {
            if (inputName == 'username') return 'sampleUsername';
            if (inputName == 'password') return 'samplePassword';
            if (inputName == 'login-server') return 'sampleServer';
        });
        process.env['RUNNER_TEMP'] = 'tempDirPath';
        process.env['DOCKER_CONFIG'] = 'existingConfigPath';
        jest.spyOn(io, 'mkdirP').mockImplementation();
        jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        jest.spyOn(fs, 'readFileSync').mockReturnValue('invalid');
        jest.spyOn(fs, 'writeFileSync').mockImplementation();
        jest.spyOn(core, 'exportVariable').mockImplementation();
        jest.spyOn(Date, 'now').mockImplementation(() => 1234561234567);
        jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(core, 'debug').mockImplementation();
    
        expect(await login.run()).toBeUndefined();
        expect(io.mkdirP).toBeCalledWith('existingConfigPath');
        expect(fs.existsSync).toBeCalledWith(path.join('existingConfigPath', 'config.json'));
        expect(fs.readFileSync).toBeCalledWith(path.join('existingConfigPath', 'config.json'), 'utf8');
        const writeContent = JSON.stringify({
            "auths": {
                "sampleServer": {
                    auth: Buffer.from('sampleUsername:samplePassword').toString('base64')
                }
            }
        })
        expect(fs.writeFileSync).toBeCalledWith(path.join('existingConfigPath', 'config.json'), writeContent);
        expect(core.exportVariable).toBeCalledWith('DOCKER_CONFIG', 'existingConfigPath');
    });    

    test('run() - overwrite existing file if retrieved config json does not have required fields', async () => {
        jest.spyOn(core, 'getInput').mockImplementation((inputName, options) => {
            if (inputName == 'username') return 'sampleUsername';
            if (inputName == 'password') return 'samplePassword';
            if (inputName == 'login-server') return 'sampleServer';
        });
        process.env['RUNNER_TEMP'] = 'tempDirPath';
        process.env['DOCKER_CONFIG'] = 'existingConfigPath';
        jest.spyOn(io, 'mkdirP').mockImplementation();
        jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        jest.spyOn(fs, 'readFileSync').mockReturnValue('{}');
        jest.spyOn(fs, 'writeFileSync').mockImplementation();
        jest.spyOn(core, 'exportVariable').mockImplementation();
        jest.spyOn(Date, 'now').mockImplementation(() => 1234561234567);
        jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(core, 'debug').mockImplementation();
    
        expect(await login.run()).toBeUndefined();
        expect(io.mkdirP).toBeCalledWith('existingConfigPath');
        expect(fs.existsSync).toBeCalledWith(path.join('existingConfigPath', 'config.json'));
        expect(fs.readFileSync).toBeCalledWith(path.join('existingConfigPath', 'config.json'), 'utf8');
        const writeContent = JSON.stringify({
            "auths": {
                "sampleServer": {
                    auth: Buffer.from('sampleUsername:samplePassword').toString('base64')
                }
            }
        })
        expect(fs.writeFileSync).toBeCalledWith(path.join('existingConfigPath', 'config.json'), writeContent);
        expect(core.exportVariable).toBeCalledWith('DOCKER_CONFIG', 'existingConfigPath');
    });    
}); 