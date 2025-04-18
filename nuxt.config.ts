export default defineNuxtConfig({
	modules: [
		"@nuxt/eslint",
		"@nuxt/fonts",
		"@nuxt/icon",
		"@nuxt/image",
		"@nuxt/ui",
		"@vueuse/nuxt",
		"@polar-sh/nuxt",
	],
	devtools: { enabled: true },
	app: {
		head: {
			title: "Nuxt Polar Guide",
			titleTemplate: "%s - Nuxt Polar Guide",
			link: [{ rel: "icon", type: "image/png", href: "/logo.svg" }],
		},
	},
	css: ["~/assets/css/main.css"],
	colorMode: {
		preference: "system",
	},
	runtimeConfig: {
		public: {
			baseUrl: "",
		},
		polarToken: "",
		polarServer: "",
		polarWebhookSecret: "",
	},
	future: {
		compatibilityVersion: 4,
	},
	compatibilityDate: "2024-11-01",
	typescript: {
		strict: true,
	},
	eslint: {
		config: {
			stylistic: {
				semi: true,
				quotes: "double",
				commaDangle: "always-multiline",
				indent: "tab",
			},
		},
	},
});
