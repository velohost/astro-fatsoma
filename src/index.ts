import type { AstroIntegration } from "astro";

export interface AstroFatsomaOptions {
  pageId: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __ASTRO_FATSOMA_CONFIG__:
    | AstroFatsomaOptions
    | undefined;
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
      "astro:config:setup"({ config }) {
        if (config.output === "static") {
          throw new Error(
            '[astro-fatsoma] This plugin requires SSR. Set `output: "server"`.'
          );
        }

        // ✅ Store config globally for SSR runtime access
        globalThis.__ASTRO_FATSOMA_CONFIG__ = {
          pageId: options.pageId,
        };
      },
    },
  };
}