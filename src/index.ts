import { define, XWorker } from "polyscript";

export const waitFor = (condition, checkInterval = 100) => {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!condition()) return;
        clearInterval(interval);
        resolve(undefined);
      }, checkInterval);
    });
  };
  

export function writePythonFiles(files) {
  const python = ["from pathlib import Path as _Path"];

  const write = (base, literal) => {
    for (const [key, value] of Object.entries(literal)) {
      const path = `_Path("${base}/${key}")`;
      if (typeof value === "string") {
        const code = JSON.stringify(value);
        python.push(`${path}.write_text(${code})`);
      } else {
        python.push(`${path}.mkdir(parents=True, exist_ok=True)`);
        write(`${base}/${key}`, value);
      }
    }
  };

  write(".", files);

  python.push("del _Path");
  python.push("\n");

  return python.join("\n");
}

const stdlib = {
  pysandbox: {
    "__init__.py": `
from ._target import current_target
from . import api
from .display import display

__all__ = [
    "api",
    "current_target",
    "display",
]
    `,
    "_target.py": `
target = None
def current_target():
    return target
`,
    "api.py": `
import js
import micropip
import pyodide
from . import current_target as _current_target
async def micropip_install(packages):
    try:
        return await micropip.install(packages)
    except Exception as e:
        print(e)
        js.onError(str(e), _current_target())


async def run_async(code):
  try:
      return await pyodide.code.eval_code_async(code, {globals: dict()})
  except Exception as e:
      print(e)
      js.onError(str(e), _current_target())


async def format_code(code):
    await micropip_install(["black"])
    import black

    BLACK_MODE = black.Mode(target_versions={black.TargetVersion.PY311})

    try:
        code = black.format_file_contents(code, fast=False, mode=BLACK_MODE)
    except black.NothingChanged:
        pass

    return code


def find_imports(code):
    return pyodide.code.find_imports(code)


__all__ = [
    "micropip_install",
    "run_async",
    "format_code",
    "find_imports",
]
`,

    "display.py": `
import js
import json
import base64
import io
import re
from pysandbox import current_target

  
MIME_METHODS = {
    "__repr__": "text/plain",
    "_repr_html_": "text/html",
    "_repr_markdown_": "text/markdown",
    "_repr_svg_": "image/svg+xml",
    "_repr_png_": "image/png",
    "_repr_pdf_": "application/pdf",
    "_repr_jpeg_": "image/jpeg",
    "_repr_latex": "text/latex",
    "_repr_json_": "application/json",
    "savefig": "image/png",
}
  
  
def render_image(mime, value, meta):
    # If the image value is using bytes we should convert it to base64
    # otherwise it will return raw bytes and the browser will not be able to
    # render it.
    if isinstance(value, bytes):
        value = base64.b64encode(value).decode("utf-8")
  
    # This is the pattern of base64 strings
    base64_pattern = re.compile(
        r"^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$"
    )
    # If value doesn't match the base64 pattern we should encode it to base64
    if len(value) > 0 and not base64_pattern.match(value):
        value = base64.b64encode(value.encode("utf-8")).decode("utf-8")
  
    return f"data:{mime};charset=utf-8;base64,{value}"
  
  
def identity(value, meta):
    return value
  
  
MIME_RENDERERS = {
    "text/html": identity,
    "text/plain": identity,
    "image/png": lambda value, meta: render_image("image/png", value, meta),
    "image/jpeg": lambda value, meta: render_image("image/jpeg", value, meta),
    "image/svg+xml": lambda value, meta: render_image("image/svg+xml", value, meta),
    "application/json": identity,
}
  
  
def eval_formatter(obj, print_method):
    """
    Evaluates a formatter method.
    """
    if print_method == "__repr__":
        return repr(obj)
    elif hasattr(obj, print_method):
        if print_method == "savefig":
            buf = io.BytesIO()
            obj.savefig(buf, format="png")
            buf.seek(0)
            return base64.b64encode(buf.read()).decode("utf-8")
        return getattr(obj, print_method)()
    elif print_method == "_repr_mimebundle_":
        return {}, {}
    return None
  
  
def format_mime(obj):
    """
    Formats object using _repr_x_ methods.
    """
    if isinstance(obj, str):
        return obj, "text/plain"
  
    mimebundle = eval_formatter(obj, "_repr_mimebundle_")
    if isinstance(mimebundle, tuple):
        format_dict, _ = mimebundle
    else:
        format_dict = mimebundle

    output, not_available = None, []
    for method, mime_type in reversed(MIME_METHODS.items()):
        if mime_type in format_dict:
            output = format_dict[mime_type]
        else:
            output = eval_formatter(obj, method)
  
        if output is None:
            continue
        elif mime_type not in MIME_RENDERERS:
            not_available.append(mime_type)
            continue
        break
    if output is None:
        if not_available:
            print(
                f"Rendered object requested unavailable MIME renderers: {not_available}"
            )
        output = repr(output)
        mime_type = "text/plain"
    elif isinstance(output, tuple):
        output, meta = output
    else:
        meta = {}
    return MIME_RENDERERS[mime_type](output, meta), mime_type


def display(obj):
    data, mime_type = format_mime(obj)
    js.display(data, current_target(), mime_type)

`,
  },
};

interface IPySandbox {
  exec: (code: string) => Promise<void>;
}

interface PySandboxPlugin {
  beforeExec?: (pysandbox: IPySandbox, code: string) => Promise<void>;
}

interface PySandboxOptions {
  plugins?: PySandboxPlugin[];
  jsApi?: Record<string, Function>;
  files?: Record<string, any>;
  packages?: string[];
  secure?: boolean;
}

abstract class PySandbox { 
    onError(errStr: string) {
        console.error(errStr);
    }
    display(data: string, id: string, mime: string) {
        const target = document.getElementById(id);
        if (mime.startsWith("image/")) {
            const image = document.createElement("img");
            image.src = data;
            target!.appendChild(image);
        } else if (mime === "text/html") {
            const iframe = document.createElement("iframe") as HTMLIFrameElement;
            iframe.srcdoc = data;
            iframe.setAttribute("sandbox", "allow-scripts");
            iframe.setAttribute("style", "width: 100%; border: 0");
            target!.appendChild(iframe);
        } else {
            const pre = document.createElement("pre");
            pre.innerText = data;
            target!.appendChild(pre);
        }  
    }
}

export class PyWorkerSandbox extends PySandbox implements IPySandbox {
  #sync: ProxyHandler<Worker>;
  #options?: PySandboxOptions;
  constructor(options?: PySandboxOptions) {
    super();
    this.#options = options;
  }

  async init() {
    const workerCode = `
import js
import sys
import polyscript
import pysandbox
    
for name in pysandbox.api.__all__:
    setattr(polyscript.xworker.sync, name, getattr(pysandbox.api, name))

${
  this.#options?.secure
    ? "js.document = polyscript.xworker.window.document.implementation.createHTMLDocument()"
    : "js.document = polyscript.xworker.window.document"
}
  
for name in polyscript.xworker.sync.jsExports().to_py():
    setattr(js, name, getattr(polyscript.xworker.sync, name))
  
onWorkerReady = polyscript.xworker.sync.onWorkerReady

${this.#options?.secure ? "del polyscript.xworker" : ""}
  
onWorkerReady()
`;

    const pyworker: XWorker = new XWorker(
      URL.createObjectURL(
        new Blob([`${writePythonFiles({ ...stdlib, ...this.#options?.files })}\n${workerCode}`], { type: "text/plain" })
      ),
      {
        type: "pyodide",
        config: {
          packages: this.#options?.packages ?? [],
        },
      }
    );

    const jsApi = {
        "onError": this.onError,
        "display": this.display,
        ...this.#options?.jsApi
    }

    for (const [name, api] of Object.entries(jsApi)) {
      pyworker.sync[name] = api;
    }
    pyworker.sync.jsExports = () => Object.keys(jsApi);
    pyworker.sync.onWorkerReady = () => {
      this.#sync = pyworker.sync;
    };
    await waitFor(() => this.#sync);
  }

  async exec(code: string) {
    for (const plugin of this.#options?.plugins ?? []) {
      await plugin.beforeExec?.(this, code);
    }
    return this.#sync["run_async"](code);
  }

  async micropip_install(packages: string[]) {
    return this.#sync["micropip_install"](packages);
  }
}

export class PyMainThreadSandbox extends PySandbox implements IPySandbox {
  #wrap: any;
  #options?: PySandboxOptions;
  constructor(options?: PySandboxOptions) {
    super();
    this.#options = options;
  }

  async init() {
    define(null, {
      interpreter: "pyodide",
      config: JSON.stringify({ packages: this.#options?.packages || [] }),
      onInterpreterReady: async (wrap) => {
        await wrap.interpreter.runPythonAsync(writePythonFiles({ ...stdlib, ...this.#options?.files }));

        const jsApi = {
            "onError": this.onError,
            "display": this.display,
            ...this.#options?.jsApi
        }

        if (this.#options?.secure) {
          wrap.interpreter.unregisterJsModule("js");
          await wrap.interpreter.runPythonAsync(`import sys\ndel sys.modules["js"]`);
    
          wrap.interpreter.registerJsModule("js", {
            Object,
            ImageData,
            FontFace,
            document: document.implementation.createHTMLDocument(),
            devicePixelRatio,
            fetch: window.fetch.bind(window),
            clearInterval: window.clearInterval.bind(window),
            clearTimeout: window.clearTimeout.bind(window),
            setInterval: window.setInterval.bind(window),
            setTimeout: window.setTimeout.bind(window),
            ...jsApi,
          });
        } else {
          for (const api of Object.keys(jsApi)) {
            globalThis[api] = jsApi[api];
          }
        }

        this.#wrap = wrap;
      },
    });
    await waitFor(() => this.#wrap);
  }

  async exec(code: string) {
    for (const plugin of this.#options?.plugins ?? []) {
      await plugin.beforeExec?.(this, code);
    }
    const globals = this.#wrap.interpreter.globals.get("dict")();
    return this.#wrap.interpreter.runPythonAsync(code, { globals });
  }

  async micropip_install(packages: string[]) {
    await this.#wrap.interpreter.loadPackage("micropip");
    const micropip = await this.#wrap.interpreter.pyimport("micropip");
    await micropip.install(packages);
    micropip.destroy();
  }
}