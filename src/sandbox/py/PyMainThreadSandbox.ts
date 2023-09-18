import { define } from "polyscript";
import stdlib from "./stdlib/index";
import { waitFor } from "../../utils";
import { writePythonFiles, display } from "./utils";
import { PySandboxOptions } from "./types";
import { ISandbox } from "../../sanbox";
import bootstrapMain from "./stdlib/bootstrap_main.py";

export class PyMainThreadSandbox implements ISandbox {
  #wrap: any;
  #options?: PySandboxOptions;
  constructor(options?: PySandboxOptions) {
    this.#options = options;
  }

  async init(options?: Record<string, any>) {
    define(null, {
      interpreter: "pyodide",
      config: JSON.stringify({ packages: this.#options?.packages || [] }),
      onInterpreterReady: async (wrap: any) => {
        await wrap.interpreter.runPythonAsync(
          writePythonFiles({ ...stdlib, ...this.#options?.modules }),
        );

        const jsApi = {
          display,
          ...this.#options?.jsApi,
        };

        if (this.#options?.restricted) {
          wrap.interpreter.unregisterJsModule("js");
          await wrap.interpreter.runPythonAsync(
            `import sys\ndel sys.modules["js"]`,
          );

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
      ...options,
    });
    await waitFor(() => Boolean(this.#wrap));
    return this.#wrap;
  }

  async exec(code: string, target?: string) {
    const globals = this.#wrap.interpreter.globals.get("dict")();
    globals.set("_pysandbox_target", target);
    return this.#wrap.interpreter.runPythonAsync(`${bootstrapMain}${code}`, {
      globals,
    });
  }

  async installPackages(packages: string[], options?: { keep_going: boolean }) {
    await this.#wrap.interpreter.loadPackage("micropip");
    const micropip = await this.#wrap.interpreter.pyimport("micropip");
    try {
      if (options?.keep_going) {
        for (const pkg of packages) {
          try {
            await micropip.install(pkg);
          } catch (e) {
            console.error(e);
          }
        }
      } else {
        await micropip.install(packages);
      }
    } finally {
      micropip.destroy();
    }
  }

  async findImports(code: string) {
    const pyodideModule = await this.#wrap.interpreter.pyimport("pyodide");
    try {
      return pyodideModule.code.find_imports(code);
    } finally {
      pyodideModule.destroy();
    }
  }

  async formatCode(code: string) {
    const pysandbox = await this.#wrap.interpreter.pyimport("pysandbox");
    try {
      return pysandbox.api.format_code(code, null);
    } finally {
      pysandbox.destroy();
    }
  }
}
