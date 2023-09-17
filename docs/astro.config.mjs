import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'PySandbox Docs',
			social: {
				github: 'https://github.com/bugzpodder/pysandbox',
			},
			sidebar: [
				{
					label: 'Guides',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Demo', link: '/guides/demo/' },
						{ label: 'Examples', link: '/guides/examples/' },
						{ label: 'Installation', link: '/guides/installation/' },
					],
				},
				{
					label: 'Demo',
					autogenerate: { directory: 'demo' },
				},
			],
		}),
	],
});
