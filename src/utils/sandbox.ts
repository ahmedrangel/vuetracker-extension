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

const trustedEval = (value: string) => {
  const trustedScript = window.trustedTypes.createPolicy("vuetracker-policy", { createScript: (x: string) => x });
  return window.eval(trustedScript.createScript(value));
};

const isTrustedEval = () => {
  try {
    trustedEval("1 + 1");
    return true;
  }
  catch {
    return false;
  }
};

export const evaluate = async (value: string) => {
  const sandbox = useSandbox();
  const isTrusted = isTrustedEval();
  try {
    if (isTrusted) throw new Error("Trusted eval");
    const exec = sandbox.compileAsync(`return ${value};`);
    const sandboxed = await exec().run();
    return sandboxed;
  }
  catch {
    if (!isTrusted) return;
    return trustedEval(`(${value});`);
  }
};
