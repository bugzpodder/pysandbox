export interface ISandbox {
  init: (options?: Record<string, any>) => Promise<any>;
  exec: (code: string, target?: string) => Promise<any>;
  installPackages: (
    packages: string[],
    options?: { keep_going: boolean },
  ) => Promise<void>;
  findImports: (code: string) => Promise<string[]>;
  formatCode: (code: string) => Promise<string>;
}
