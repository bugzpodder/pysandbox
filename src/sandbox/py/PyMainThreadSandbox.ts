import { define } from "polyscript";
import runtimeModule from "./python/runtime";
import { writePythonFiles, display } from "./utils";
import { PySandboxOptions } from "./types";
import { ISandbox } from "../../sanbox";
import bootstrapProgramCode from "./python/main/bootstrap_program.py";
import bootstrapCode from "./python/main/bootstrap_common.py";
import bootstrapRestrictedCode from "./python/main/bootstrap_restricted.py";

export class PyMainThreadSandbox implements ISandbox {
  #wrap: any;
  #options?: PySandboxOptions;
  constructor(options?: PySandboxOptions) {
    this.#options = options;
  }

  async init(options?: Record<string, any>) {
    return new Promise((resolve, reject) => {
      define(null, {
        interpreter: "pyodide",
        config: JSON.stringify({ packages: this.#options?.packages || [] }),
        hooks: {
          main: {
            onReady: async (wrap) => {
              const bootstrapModulesCode = writePythonFiles({
                ...runtimeModule,
                ...this.#options?.modules,
              });
              const bootstrapMainCode = `${bootstrapCode}${
                this.#options?.restricted ? bootstrapRestrictedCode : ""
              }`;

              await wrap.interpreter.runPythonAsync(
                `${bootstrapModulesCode}${bootstrapMainCode}`,
              );

              const jsApi = {
                display,
                ...this.#options?.jsApi,
              };

              if (this.#options?.restricted) {
                wrap.interpreter.unregisterJsModule("js");
                wrap.interpreter.registerJsModule("js", {
                  Object,
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
              resolve(wrap);
            },
          },
        },
        ...options,
      });
    });
  }

  async exec(code: string, target?: string) {
    const globals = this.#wrap.interpreter.globals.get("dict")();
    globals.set("_pysandbox_target", target);
    return this.#wrap.interpreter.runPythonAsync(
      `${bootstrapProgramCode}${code}`,
      {
        globals,
      },
    );
  }

  async installPackages(packages: string[], options?: { keep_going: boolean }) {
    await this.#wrap.interpreter.loadPackage("micropip");
    const micropip = await this.#wrap.interpreter.pyimport("micropip");
    try {
      await micropip.install(packages, options);
    } finally {
      micropip.destroy();
    }
  }

  async findImports(code: string) {
    const pyodideModule = await this.#wrap.interpreter.pyimport("pyodide");
    const importlib = await this.#wrap.interpreter.pyimport("importlib");

    try {
      return pyodideModule.code
        .find_imports(code)
        .filter((pkg) => !importlib.util.find_spec(pkg));
    } finally {
      pyodideModule.destroy();
      importlib.destroy();
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
