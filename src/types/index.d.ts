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
    isStatic: boolean;
    hasSSR: boolean;
    vueVersion?: string;
  }
}

export {};
