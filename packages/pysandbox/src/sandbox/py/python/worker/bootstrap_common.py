import js
import polyscript
import pysandbox

for name in pysandbox.api.__all__:
    setattr(polyscript.xworker.sync, name, getattr(pysandbox.api, name))

for name in polyscript.xworker.sync.jsExports().to_py():
    setattr(js, name, getattr(polyscript.xworker.sync, name))

js.postMessage("__ready__")
