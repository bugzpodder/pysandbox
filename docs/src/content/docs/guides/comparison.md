---
title: Comparison
description: A comparison of PySandbox and other libraries.
---

## Pyodide

PySandbox uses [Pyodide](https://github.com/pyodide/pyodide) under the hood. If you are running python code on the main thread, it's fairly simple to bootstrap Pyodide directly in your code. On the other hand, PySandbox will provide additional utilities like `display` for showing pyplots and managing other [IPython](https://ipython.readthedocs.io/en/stable/config/integrating.html) outputs.

Pyodide does not setup web workers out of the box. If you site is [crossOriginIsolated](https://web.dev/coop-coep/), PySandbox can be easily configured to execute python code in a web worker.

## PyScript

[PyScript](https://pyscript.net/) is great for configuring a single html page to run python code. However if you are using a JS web-framework (e.g. a React-based framework) to build your web application, PySandbox can provide finer-grained control from its API.