const BINARY_MAP = {
    'x64':   'neutralino-linux_x64',
    'arm64': 'neutralino-linux_arm64',
    'armhf': 'neutralino-linux_armhf'
};

module.exports.validate = function(config) {
    const errors = [];
    if (!config.appName)     errors.push('appName is required');
    if (!config.version)     errors.push('version is required');
    if (!config.description) errors.push('description is required');
    return { valid: errors.length === 0, errors };
};

module.exports.build = function(config, distPath, arch) {
    return Promise.reject(
        new Error(
            'AppImage driver is not yet implemented in this POC.\n' +
            'Full implementation planned for GSoC Week 6.\n' +
            'The driver will construct an AppDir with AppRun script,\n' +
            '.desktop file, and .png icon, then invoke appimagetool\n' +
            'with --appimage-extract-and-run for WSL/CI compatibility.'
        )
    );
};
