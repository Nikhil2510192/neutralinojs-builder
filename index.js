const path = require('path');

const SUPPORTED_TARGETS = ['deb', 'nsis', 'appimage'];

const PLATFORM_GUARD = {
    'deb':      ['linux'],
    'appimage': ['linux'],
    'nsis':     ['linux', 'win32']
};

function loadDriver(target) {
    return require(path.join(__dirname, 'targets', `${target}.js`));
}

module.exports.command = 'builder';
module.exports.register = function(program, modules) {
    program
        .arguments('[target]')
        .description('Generate platform-specific application installers')
        .option('--x64',   'Build for x64 architecture')
        .option('--arm64', 'Build for arm64 architecture')
        .option('--armhf', 'Build for armhf architecture')
        .option('--ia32',  'Build for ia32 architecture')
        .action(async (target, cmd) => {

            // Resolve arch from flags
            let arch = 'x64';
            if (cmd.arm64) arch = 'arm64';
            if (cmd.armhf) arch = 'armhf';
            if (cmd.ia32)  arch = 'ia32';

            // Validate target
            if (!target) {
                console.error(
                    'neu: ERRR No target specified.\n' +
                    'Usage: neu builder <target> [arch]\n' +
                    'Supported targets: ' + SUPPORTED_TARGETS.join(', ') + '\n' +
                    'Example: neu builder deb --x64'
                );
                process.exit(1);
            }

            if (!SUPPORTED_TARGETS.includes(target)) {
                console.error(
                    `neu: ERRR Unsupported target: ${target}\n` +
                    'Supported targets: ' + SUPPORTED_TARGETS.join(', ')
                );
                process.exit(1);
            }

            // Platform Guard
            const platform = process.platform;
            const allowed  = PLATFORM_GUARD[target];
            if (!allowed.includes(platform)) {
                console.error(
                    `neu: ERRR Target '${target}' is not supported on ${platform}.\n` +
                    `Supported platforms for '${target}': ${allowed.join(', ')}`
                );
                process.exit(1);
            }

            // Load config
            const config = {
                appName:     'myapp',
                version:     '1.0.0',
                maintainer:  'Nikhil Pagadala <nikhilpagadala2006@gmail.com>',
                description: 'A Neutralinojs application'
            };

            const distPath = path.join(process.cwd(), 'dist', 'neutralino');

            // Load and run driver
            const driver = loadDriver(target);

            const validation = driver.validate(config);
            if (!validation.valid) {
                console.error('neu: ERRR Validation failed:');
                validation.errors.forEach(e => console.error('  -', e));
                process.exit(1);
            }

            console.log(`neu: INFO Building ${target} package for ${arch}...`);

            try {
                const result = await driver.build(config, distPath, arch);
                console.log(`neu: INFO Package created at: ${result.outputPath}`);
            } catch (err) {
                console.error(`neu: ERRR Build failed: ${err.message}`);
                process.exit(1);
            }
        });
};
