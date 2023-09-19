---
title: References
description: References for PySandbox.
---

The `pysandbox` library exports two classes: `PyMainThreadSandbox` and `PyWorkerSandbox`.

`PyMainThreadSandbox` will execute python code on the main thread while `PyWorkerSandbox` will execute python code in a web worker if [crossOriginIsolated](https://web.dev/coop-coep/).

Both classes shares an identical interface.

```js
interface ISandbox {
    init: (options?: Record<string, any>) => Promise<any>;
    exec: (code: string, target?: string) => Promise<any>;
    installPackages: (packages: string[], options?: {
        keep_going: boolean;
    }) => Promise<void>;
    findImports: (code: string) => Promise<string[]>;
    formatCode: (code: string) => Promise<string>;
}
```

The `init` function takes an optional argument that will be passed in to polyscript's define/XWorker interface for convinence.

`exec` takes the python code to be executed, as well as an optional DOM id as target if the code is expected to render an image or output some content.

`installPackages` will use Pyodide's micropip to install packages for you.

`findImports` will output a list of imports made by the python code. Note that imports are not same as packages and may conclude custom modules like `js` or python stdlib.

`formatCode` uses `black` for format your codeblock.

Example Usage:

```js
const sandbox = new PyMainThreadSandbox();
await sandbox.init();
await sandbox.installPackages(["numpy", "matplotlib"]);
await sandbox.exec(`...`, "output");
```
