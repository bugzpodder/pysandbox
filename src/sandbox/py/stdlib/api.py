import sys
import js
import micropip
import pyodide


async def micropip_install(packages, id, keep_going=False):
    try:
        if keep_going:
            for package in packages:
                try:
                    await micropip.install(package)
                except Exception as e:
                    print(e, file=sys.stderr)
        else:
            await micropip.install(packages)
    except Exception as e:
        if id:
            print(e, file=sys.stderr)
            js.onError(str(e), id)
        else:
            raise e


async def run_async(code, target, id):
    bootstrap_code = """
def current_target():
    return _pysandbox_target

from pysandbox import display
"""

    globals = dict({"_pysandbox_target": target})
    try:
        return await pyodide.code.eval_code_async(
            f"{bootstrap_code}{code}", globals=globals
        )
    except Exception as e:
        if id:
            print(e, file=sys.stderr)
            js.onError(str(e), id)
        else:
            raise e


async def format_code(code, id):
    await micropip_install(["black"], id)
    import black

    BLACK_MODE = black.Mode(target_versions={black.TargetVersion.PY311})

    try:
        code = black.format_file_contents(code, fast=False, mode=BLACK_MODE)
    except black.NothingChanged:
        pass
    except Exception as e:
        if id:
            print(e, file=sys.stderr)
            js.onError(str(e), id)
        else:
            raise e

    return code


def find_imports(code):
    return pyodide.code.find_imports(code)


__all__ = [
    "micropip_install",
    "run_async",
    "format_code",
    "find_imports",
]
