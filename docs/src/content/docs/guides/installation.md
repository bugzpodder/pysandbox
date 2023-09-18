---
title: PySandbox
description: How to install PySandbox.
---

The pysandbox package is available as a npm module.

To use it simply run `yarn add pysandbox` or use your favorite package manager.

Usage in html:

```html
<script type="module">
  import { PyMainThreadSandbox } from "https://esm.sh/pysandbox@0.3.1/";
  const sandbox = new PyMainThreadSandbox();
  await sandbox.init();
  await sandbox.exec("display('Hello', target=current_target())", "output");
</script>
<div id="output"></div>
```
