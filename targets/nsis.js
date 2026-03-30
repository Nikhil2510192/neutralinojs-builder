const BINARY_MAP = {
    'x64':  'neutralino-win_x64.exe',
    'ia32': 'neutralino-win_ia32.exe'
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
    return Promise.reject(
        new Error(
            'NSIS driver is not yet implemented in this POC.\n' +
            'Full implementation planned for GSoC Week 7.\n' +
            'The driver will generate a .nsi script and invoke makensis,\n' +
            'with backslashes for install destination paths and\n' +
            'forward slashes for source file references.'
        )
    );
};
