export const vueTrackerConsole = {
  info: (text: string) => console.info(`%c[VueTracker] %c[INFO] %c${text}`, "color: #00c950;", "color: #00aaff;", "color: inherit;")
};