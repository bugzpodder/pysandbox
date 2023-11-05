---
title: Runtime
description: Runtime Reference for PySandbox library.
---

PySandbox includes a custom runtime module `pysandbox.py`
with a single a single function:

```python
def display(obj, target, mime_type=None):
  ...
```

For convinence this is auto-imported into every codeblock via:

```python
import display from pysandbox
```

You can pass in an [ipython compatible object](https://ipython.readthedocs.io/en/stable/config/integrating.html) that exposes _repr_\*\*\*\*\_ or `matplotlib.pyplot`.

```python
import plt from matplotlib

...

display(plt, target=current_target())
```

where `current_target` is a pre-defined convenience function:

```python
def current_target():
    return _pysandbox_target
```

which returns the target passed into `exec`.

Here is a full example:

```html
<div id="output"></div>
```

```js
const sandbox = new PyMainThreadSandbox();
await sandbox.init();
await sandbox.exec("display('hello', current_target())", "output");
```
