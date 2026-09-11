import "wxt";
import { access, mkdir } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { defineWxtModule } from "wxt/modules";
import sharp from "sharp";

const index = defineWxtModule(async (wxt) => {
  const parsedOptions = {
    baseIconPath: resolve(wxt.config.srcDir, "assets/icon.png"),
    grayscale: true,
    sizes: [128, 48, 32, 16]
  };
  const resolvedPath = resolve(wxt.config.srcDir, parsedOptions.baseIconPath);
  try {
    await access(resolvedPath);
  }
  catch {
    return wxt.logger.warn(
      `\`[auto-icons]\` Skipping icon generation, no base icon found at ${relative(process.cwd(), resolvedPath)}`
    );
  }
  wxt.hooks.hook("build:done", async (wxt2, output) => {
    const image = sharp(resolvedPath).png();
    if (parsedOptions.grayscale) {
      image.grayscale();
    }
    const outputFolder = wxt2.config.outDir;
    for (const size of parsedOptions.sizes) {
      const resized = image.resize(size);
      await mkdir(resolve(outputFolder, "icons"), { recursive: true });
      await resized.toFile(resolve(outputFolder, `icons/${size}-gray.png`));
      output.publicAssets.push({
        type: "asset",
        fileName: `icons/${size}-gray.png`
      });
    }
  });
  wxt.hooks.hook("prepare:publicPaths", (wxt2, paths) => {
    for (const size of parsedOptions.sizes) {
      paths.push(`icons/${size}-gray.png`);
    }
  });
});

export { index as default };
