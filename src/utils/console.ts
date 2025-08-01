export const vueTrackerConsole = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: (text: string, ...optionalParams: any[]) => {
    const decoratedText = [`%c[VueTracker] %c[INFO] %c${text}`, "color: #00c950;", "color: #00aaff;", "color: inherit;", ...optionalParams];
    console.info(...decoratedText);
    return decoratedText;
  }
};
