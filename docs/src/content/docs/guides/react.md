---
title: React Integration
description: Use PySandbox in React.
---

The easiest way to use `PySandbox` in a React application is by using the `useEffect` hook to execute the Python code.

```js
import { useEffect, useId, useRef } from "react";
import { PyMainThreadSandbox } from "pysandbox";

function usePython() {
  const ref = useRef();
  return {
    runPython: async (code, id) => {
      if (!ref.current) {
        ref.current = new PyMainThreadSandbox();
      }
      const sandbox = ref.current;
      await sandbox.init();
      if (id) {
        document.getElementById(id).replaceChildren();
      }
      await sandbox.exec(code, id);
    },
  };
}

function CodeBlock({ code }) {
  const id = useId();
  const { runPython } = usePython();
  useEffect(() => {
    runPython(code, id);
  }, [code]);

  return <div id={id} />;
}
```
