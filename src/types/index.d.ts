declare global {

  interface VueTrackerTechnology {
    slug: string;
    name: string;
    version?: string | null;
  }
  interface VueTrackerResponse {
    hostname?: string;
    url: string;
    meta: {
      description?: string | null;
      icons?: VueTrackerSiteIcons[];
      isAdultContent: boolean;
      language?: string;
      siteName?: string | null;
      title?: string;
      ogImage?: string | null;
      icons: VueTrackerSiteIcons[];
    };
    framework: VueTrackerTechnology | null;
    frameworkModules: VueTrackerTechnology[];
    plugins: VueTrackerTechnology[];
    ui: VueTrackerTechnology;
    isStatic?: boolean;
    hasSSR: boolean;
    vueVersion?: string;
  }

  // Extend the Element and Window interfaces
  interface Element {
    __vue__?: { $root?: { constructor?: { version?: string } } };
    __vue_app__?: { version?: string };
  }

  interface Window {
    Vue?: { version?: string };
    $nuxt?: { $root?: { constructor?: { version?: string } } };
    __unctx__?: {
      get: (key: string) => {
        use: () => { versions?: { nuxt?: string } };
      };
    };
    trustedTypes: {
      createPolicy: (name: string, rules: { [x: string]: (input: string) => string }) => { [x: string]: (input: string) => string };
    };
  }
}

export {};
