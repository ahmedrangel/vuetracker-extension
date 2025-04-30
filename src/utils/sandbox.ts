import Sandbox from "@nyariv/sandboxjs";

export const useSandbox = () => {
  const prototypeWhitelist = Sandbox.SAFE_PROTOTYPES;
  const whitelisted = [Document, StyleSheet, CSSStyleSheet, CSSStyleRule, CSSRule, Element, Attr];
  for (const proto of whitelisted) {
    prototypeWhitelist.set(proto, new Set());
  }

  return new Sandbox({
    forbidFunctionCalls: false,
    forbidFunctionCreation: false,
    prototypeWhitelist,
    globals: { ...Sandbox.SAFE_GLOBALS, ...window }
  });
};