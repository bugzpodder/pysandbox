import sys
import js
import micropip
import pyodide
import pyodide_js
import os
import importlib


async def micropip_install(packages, id, keep_going=False):
    try:
        await micropip.install(packages, keep_going=keep_going)
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

    if not os.environ.get("MPLBACKEND"):
        os.environ["MPLBACKEND"] = "template"

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
    packages = [
        package
        for package in pyodide.code.find_imports(code)
        if importlib.util.find_spec(package) is None
    ]
    importMapper = pyodide_js._api and pyodide_js._api._import_name_to_package_name
    if importMapper:
        return [importMapper.get(package) or package for package in packages]
    else:
        return packages


__all__ = [
    "micropip_install",
    "run_async",
    "format_code",
    "find_imports",
]
