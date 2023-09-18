---
title: Options
description: References for PySandbox options.
---

Both

`PyMainThreadSandbox` and `PyWorkerSandbox` takes an optional argument in constructor with the following:

```js
interface PySandboxOptions {
    jsApi?: Record<string, Function>;
    modules?: Record<string, string | Record<string, string>>;
    packages?: string[];
    restricted?: boolean;
}
```

`jsApi` is a named key value pair where the name of the function will be available in the js module.

```js
function getFooFunc() {
  console.log("getFooFunc");
}

const sandbox = new PyMainThreadSandbox({ jsApi: { getFoo: getFooFunc } });
```

will make `js.getFoo` available in python code. For example:

```python
import js
js.getFoo()
```

will call getFooFunc.

`modules` are a list of custom modules that you want to be included. For example:

```js
const modules = {
  "foo.py": `
def bar():
    pass
`,
};

const sandbox = new PyMainThreadSandbox({ jsApi: { modules } });
```

will drop a `foo.py` into the FS which you can import directly.

`packages` is a list of python packages that will be installed initially in the pyodide interpreter. eg `new PyMainThreadSandbox({ packages: ["numpy"] })` will install numpy for you.

`restricted` is a boolean that will restrict access to the real `js.document` by creating a new XMLDocument into the js scope. Turn it on when running untrusted python code so it won't have direct access to the DOM.
