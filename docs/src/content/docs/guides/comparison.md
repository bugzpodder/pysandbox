---
title: Comparison
description: A comparison of PySandbox and other libraries.
---

## Pyodide

PySandbox uses [Pyodide](https://github.com/pyodide/pyodide) under the hood. If you are running python code on the main thread, you may enjoy the flexibility of loading Pyodide directly. On the other hand, PySandbox provides a handy `display` utility for showing pyplots and managing other iPython _repr_\*\*\*\* outputs.

Pyodide also doesn't provide web worker support out of the box. If you site is [crossOriginIsolated](https://web.dev/coop-coep/), PySandbox would be able to run the python code in a web worker out of the box.

## PyScript

[PyScript](https://pyscript.net/) is great for quickly configuring a single html page to run python code. However if you are using a JS web-framework (such as React) to build your web application, PySandbox will be able to provide finer grained control via its Javascript based API.
