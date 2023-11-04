---
title: Comparison
description: A comparison of PySandbox and other libraries.
---

## Pyodide

PySandbox uses [Pyodide](https://github.com/pyodide/pyodide) under the hood. If you are running python code on the main thread, it's fairly simple to bootstrap Pyodide directly in your code. PySandbox will provide additional utilities like `display` for showing pyplots and managing other [IPython](https://ipython.readthedocs.io/en/stable/config/integrating.html) outputs.

Pyodide does not setup web workers out of the box. If you site is [crossOriginIsolated](https://web.dev/coop-coep), PySandbox can be easily configured to execute python code in a web worker.

## PyScript

[PyScript](https://pyscript.net) is great for configuring a single html page to run Python code as well as providing acess to DOM through its `pyweb` API. Python code in `PyScript` is defined in custom script tags such as `<script type="py"></script>`. If you are using a JS web-framework (e.g. a React-based framework) to build your web application, you may find `PySandbox` easier to use with its pure JS invocation without needing to rely on `<script type="py">` and `<py-script>` tags.

## react-py

[react-py](elilambnz.github.io/react-py) is a React package that provides out-of-box support for many Pyodide functionalities. `PySandbox` package is not React specific and offers more flexibility in its APIs. This [guide](/pysandbox/guides/react) covers how to use `PySandbox` in React.
