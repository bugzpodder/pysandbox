export interface PySandboxOptions {
  jsApi?: Record<string, Function>;
  modules?: Record<string, string | Record<string, string>>;
  packages?: string[];
  restricted?: boolean;
}
