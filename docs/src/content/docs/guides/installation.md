---
title: Installation
description: How to install PySandbox.
---

The pysandbox package is available as a npm module: https://www.npmjs.com/package/pysandbox

Usage in html:

```html
<script type="module">
  import { PyMainThreadSandbox } from "https://esm.sh/pysandbox@latest";
  const sandbox = new PyMainThreadSandbox();
  await sandbox.init();
  await sandbox.exec("display('Hello', target=current_target())", "output");
</script>
<div id="output"></div>
```
