# neutralinojs-builder

A CLI plugin for the [Neutralinojs CLI](https://github.com/neutralinojs/neutralinojs-cli) 
that generates platform-specific application installers from `neu build` output.

Built as a proof-of-concept for GSoC 2025.

## Installation
```bash
neu plugins --add neutralinojs-builder
```

## Usage
```bash
# Build a .deb package for Linux x64
neu builder deb --x64

# Build for arm64
neu builder deb --arm64

# Build for armhf
neu builder deb --armhf
```

## Configuration

Add to your `neutralino.config.json`:
```json
{
  "cli": {
    "builder": {
      "linux": {
        "targets": [
          {
            "target": "deb",
            "arch": ["x64", "armhf"]
          }
        ]
      },
      "win": {
        "targets": [
          {
            "target": "nsis",
            "arch": ["x64", "ia32"]
          }
        ]
      }
    }
  }
}
```

## POC Status

| Driver | validate() | build() |
|--------|-----------|---------|
| .deb | ✅ Working | ✅ Working |
| NSIS | ✅ Working | 🔧 Stub — GSoC Week 7 |
| AppImage | ✅ Working | 🔧 Stub — GSoC Week 6 |

## What the .deb driver does

1. Validates config — returns `{ valid, errors }` before any file operations
2. Selects correct binary from `dist/neutralino/` based on arch argument
3. Constructs Debian staging directory layout:
   - Binary at `usr/bin/`
   - `resources.neu` at `usr/share/appname/`
   - Generated `DEBIAN/control` with all five mandatory fields
4. Invokes `dpkg-deb --build --root-owner-group` — normalizes file ownership to `root/root`
5. Propagates exit code explicitly — non-zero exits reject the Promise
6. Cleans up staging directory on both success and failure

## Architecture
```
neutralinojs-builder (index.js)
├── command: 'builder'
├── register(program, modules)
├── Platform Guard (process.platform check)
├── Driver Loader (dynamic require from targets/)
└── targets/
    ├── deb.js      ← fully implemented
    ├── nsis.js     ← stubbed
    └── appimage.js ← stubbed
```

## Tested on

- WSL2 Ubuntu, Node v20.20.0, dpkg-deb 1.22.6 (amd64)

## Test results
```
✅ validate() catches all missing fields
✅ validate() passes correct config
✅ build() produces valid .deb — confirmed via dpkg-deb --info and --contents
✅ root/root ownership confirmed via --root-owner-group flag
✅ Unsupported arch rejected with descriptive error
✅ Missing dist/ directory rejected with actionable error message
✅ All three drivers load via dynamic require()
✅ Consistent two-method interface across all drivers
```

## Related

- [Neutralinojs CLI](https://github.com/neutralinojs/neutralinojs-cli)
- [Neutralinojs](https://github.com/neutralinojs/neutralinojs)
