import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  site: "https://bugzpodder.github.io",
  base: "/pysandbox",
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "credentialless",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
  integrations: [
    starlight({
      title: "PySandbox Docs",
      social: {
        github: "https://github.com/bugzpodder/pysandbox",
      },
      sidebar: [
        {
          label: "Guides",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Introduction", link: "guides/introduction" },
            { label: "Comparison", link: "guides/comparison" },
            { label: "Examples", link: "guides/examples" },
            { label: "Installation", link: "guides/installation" },
          ],
        },
        { label: "Documentation", autogenerate: { directory: "references" } },
        {
          label: "Examples",
          autogenerate: { directory: "examples" },
        },
      ],
    }),
  ],
});
