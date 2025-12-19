import {
	type ApplicationConfig,
	provideBrowserGlobalErrorListeners,
	provideZonelessChangeDetection,
} from "@angular/core";
import {
	provideClientHydration,
	withEventReplay,
} from "@angular/platform-browser";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import Aura from "@primeuix/themes/aura";
import {
	AllCommunityModule as AgChartsCommunityModule,
	ModuleRegistry as AgChartsModuleRegistry,
} from "ag-charts-community";
import {
	AllCommunityModule as AgGridCommunityModule,
	ModuleRegistry as AgGridModuleRegistry,
} from "ag-grid-community";
import { providePrimeNG } from "primeng/config";
import { routes } from "./app.routes";
import { provideNgxStripe } from 'ngx-stripe';

AgChartsModuleRegistry.registerModules([AgChartsCommunityModule]);
AgGridModuleRegistry.registerModules([AgGridCommunityModule]);

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideZonelessChangeDetection(),
		provideRouter(routes, withComponentInputBinding()),
		provideClientHydration(withEventReplay()),
		provideNgxStripe(),
		providePrimeNG({
			theme: {
				preset: Aura,
				options: {
					prefix: "p",
					darkModeSelector: "system",
					cssLayer: false,
				},
			},
		}),
	],
};
