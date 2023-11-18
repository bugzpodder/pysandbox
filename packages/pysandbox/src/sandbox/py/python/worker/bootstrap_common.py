import js
import polyscript
import pysandbox
import pyodide

for name in pysandbox.api.__all__:
    setattr(polyscript.xworker.sync, name, getattr(pysandbox.api, name))

for name in polyscript.xworker.sync.jsExports().to_py():
    setattr(js, name, getattr(polyscript.xworker.sync, name))

js.postMessage(pyodide.ffi.to_js({"name": "ready"}))
