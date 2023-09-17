export function writePythonFiles(files) {
  const python = ["from pathlib import Path as _Path"];

  const write = (
    base: string,
    literal: Record<string, string | Record<string, string>>,
  ) => {
    for (const key of Object.keys(literal)) {
      const value = literal[key];
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

export function display(data: string, id: string, mime: string) {
  const target = document.getElementById(id);
  if (mime.startsWith("image/")) {
    const image = document.createElement("img");
    image.src = data;
    target!.appendChild(image);
  } else if (mime === "text/html") {
    const iframe = document.createElement("iframe") as HTMLIFrameElement;
    iframe.srcdoc = data;
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.setAttribute("style", "border: 0");
    target!.appendChild(iframe);
  } else {
    const pre = document.createElement("pre");
    pre.innerText = data;
    target!.appendChild(pre);
  }
}
