import { resolve } from "node:path";
import { glob } from "node:fs/promises";
import { defineWxtModule } from "wxt/modules";

export default defineWxtModule((wxt) => {
  wxt.hook("build:publicAssets", async (_, assets) => {
    const path = "node_modules/vuetracker-analyzer/dist/icons";
    const pathFiles = glob(`${path}/*.svg`);
    for await (const pathFile of pathFiles) {
      const fileName = pathFile.split("\\").pop();
      assets.push({
        absoluteSrc: resolve(`${path}/${fileName}`),
        relativeDest: `assets/icons/${fileName}`
      });
    }
  });
});
