import { XWorker } from "polyscript";
import runtimeModule from "./python/runtime";
import { writePythonFiles, display } from "./utils";
import { PySandboxOptions } from "./types";
import { ISandbox } from "../../sanbox";
import bootstrapCode from "./python/worker/bootstrap_common.py";
import bootstrapNonRestrictedCode from "./python/worker/bootstrap_nonrestricted.py";
import bootstrapRestrictedCode from "./python/worker/bootstrap_restricted.py";

export class PyWorkerSandbox implements ISandbox {
  #sync: ProxyHandler<Worker>;
  #options?: PySandboxOptions;
  #errorCallbacks: Map<string, (errMsg: string) => void> = new Map();
  #id: number = 0;
  constructor(options?: PySandboxOptions) {
    this.#options = options;
  }

  onError(errStr: string, id: string) {
    this.#errorCallbacks.get(id)?.(errStr);
  }

  async init(options?: Record<string, any>) {
    return new Promise((resolve, reject) => {
      const bootstrapModulesCode = writePythonFiles({
        ...runtimeModule,
        ...this.#options?.modules,
      });
      const bootstrapWorkerCode = `${bootstrapCode}${
        this.#options?.restricted
          ? bootstrapRestrictedCode
          : bootstrapNonRestrictedCode
      }`;

      const pyworker = XWorker(
        URL.createObjectURL(
          new Blob([`${bootstrapModulesCode}${bootstrapWorkerCode}`], {
            type: "text/plain",
          }),
        ),
        {
          type: "pyodide",
          config: {
            packages: this.#options?.packages ?? [],
          } as any,
          ...options,
        },
      ) as Worker & { sync: Record<string, Function> };

      const jsApi = {
        onError: this.onError.bind(this),
        display,
        ...this.#options?.jsApi,
      };

      for (const name of Object.keys(jsApi)) {
        const api = jsApi[name];
        pyworker.sync[name] = api;
      }
      pyworker.sync.jsExports = () => Object.keys(jsApi);
      pyworker.sync.onWorkerReady = () => {
        this.#sync = pyworker.sync;
        resolve(pyworker);
      };
    });
  }

  createErrorContext(): [string, () => string] {
    const id = `${this.#id}`;
    this.#id++;
    let errMessage = undefined;
    const errCallback = (msg: string) => {
      errMessage = msg;
    };
    this.#errorCallbacks.set(id, errCallback);
    return [id, () => errMessage];
  }

  async exec(code: string, target?: string) {
    const [id, getError] = this.createErrorContext();
    const result = await this.#sync["run_async"](code, target, id);
    if (getError()) {
      throw new Error(getError());
    }
    return result;
  }

  async installPackages(packages: string[], options?: { keep_going: boolean }) {
    const [id, getError] = this.createErrorContext();
    const result = await this.#sync["micropip_install"](packages, id, options);
    if (getError()) {
      throw new Error(getError());
    }
    return result;
  }

  async findImports(code: string) {
    const [, getError] = this.createErrorContext();
    const result = await this.#sync["find_imports"](code);
    if (getError()) {
      throw new Error(getError());
    }
    return result;
  }

  async formatCode(code: string) {
    const [id, getError] = this.createErrorContext();
    const result = this.#sync["format_code"](code, id);
    if (getError()) {
      throw new Error(getError());
    }
    return result;
  }
}
