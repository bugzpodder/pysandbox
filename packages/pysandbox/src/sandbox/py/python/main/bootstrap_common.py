import os

if not os.environ.get("MPLBACKEND"):
    os.environ["MPLBACKEND"] = "template"
