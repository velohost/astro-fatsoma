import type { AstroIntegration } from "astro";

export interface AstroFatsomaOptions {
  pageId: string;
}

export default function astroFatsoma(
  options: AstroFatsomaOptions
): AstroIntegration {
  if (!options?.pageId) {
    throw new Error(
      "[astro-fatsoma] Missing required `pageId` in astro.config.mjs"
    );
  }

  return {
    name: "astro-fatsoma",

    hooks: {
      "astro:config:setup"({ config, updateConfig }) {
        if (config.output === "static") {
          throw new Error(
            '[astro-fatsoma] This plugin requires SSR. Set `output: "server"`.'
          );
        }

        // ✅ Inject config into the SSR bundle at build time
        updateConfig({
          vite: {
            define: {
              __ASTRO_FATSOMA_CONFIG__: JSON.stringify({
                pageId: options.pageId,
              }),
            },
          },
        });
      },
    },
  };
}