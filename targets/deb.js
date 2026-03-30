const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const BINARY_MAP = {
    'x64':   'neutralino-linux_x64',
    'arm64': 'neutralino-linux_arm64',
    'armhf': 'neutralino-linux_armhf',
    'ia32':  'neutralino-linux_ia32'
};

module.exports.validate = function(config) {
    const errors = [];
    if (!config.appName)     errors.push('appName is required');
    if (!config.version)     errors.push('version is required');
    if (!config.maintainer)  errors.push('maintainer is required');
    if (!config.description) errors.push('description is required');
    return { valid: errors.length === 0, errors };
};

module.exports.build = function(config, distPath, arch) {
    return new Promise((resolve, reject) => {
        const binaryName = BINARY_MAP[arch];
        if (!binaryName) {
            return reject(new Error(
                `Unsupported arch: ${arch}. Supported values: x64, arm64, armhf, ia32`
            ));
        }

        const binaryPath    = path.join(distPath, binaryName);
        const resourcesPath = path.join(distPath, 'resources.neu');

        if (!fs.existsSync(binaryPath)) {
            return reject(new Error(
                `Binary not found: ${binaryPath}\n` +
                `Run 'neu build' first, or check that ${binaryName} exists in dist/neutralino/`
            ));
        }

        if (!fs.existsSync(resourcesPath)) {
            return reject(new Error(
                `resources.neu not found at ${resourcesPath}\n` +
                `Run 'neu build' first.`
            ));
        }

        const archLabel  = arch === 'x64' ? 'amd64' : arch;
        const stagingDir = path.join(
            process.cwd(),
            `${config.appName}_${config.version}_${archLabel}`
        );
        const debianDir  = path.join(stagingDir, 'DEBIAN');
        const binDir     = path.join(stagingDir, 'usr', 'bin');
        const shareDir   = path.join(stagingDir, 'usr', 'share', config.appName);

        try {
            fs.mkdirSync(debianDir, { recursive: true });
            fs.mkdirSync(binDir,    { recursive: true });
            fs.mkdirSync(shareDir,  { recursive: true });

            fs.copyFileSync(binaryPath, path.join(binDir, config.appName));
            fs.chmodSync(path.join(binDir, config.appName), '755');

            fs.copyFileSync(resourcesPath, path.join(shareDir, 'resources.neu'));

            const control = [
                `Package: ${config.appName}`,
                `Version: ${config.version}`,
                `Architecture: ${archLabel}`,
                `Maintainer: ${config.maintainer}`,
                `Description: ${config.description}`
            ].join('\n') + '\n';

            fs.writeFileSync(path.join(debianDir, 'control'), control);

        } catch (err) {
            try { fs.rmSync(stagingDir, { recursive: true }); } catch (_) {}
            return reject(err);
        }

        const proc = spawn(
            'dpkg-deb',
            ['--build', '--root-owner-group', stagingDir],
            { stdio: 'inherit' }
        );

        proc.on('error', (err) => {
            try { fs.rmSync(stagingDir, { recursive: true }); } catch (_) {}
            reject(new Error(
                `Failed to start dpkg-deb: ${err.message}\n` +
                `Is dpkg-deb installed? Run: sudo apt-get install dpkg`
            ));
        });

        proc.on('exit', (code) => {
            try { fs.rmSync(stagingDir, { recursive: true }); } catch (_) {}
            if (code !== 0) {
                return reject(new Error(`dpkg-deb exited with code ${code}`));
            }
            resolve({ outputPath: stagingDir + '.deb' });
        });
    });
};
