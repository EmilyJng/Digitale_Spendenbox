import { Component, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import type { MenuItem } from "primeng/api";
import { MenubarModule } from "primeng/menubar";

@Component({
	selector: "app-root",
	imports: [RouterOutlet, MenubarModule],
	templateUrl: "./app.html",
	styleUrl: "./app.css",
})
export class App {
	protected readonly title = signal("Frontend");

	items: MenuItem[] = [
		{
			label: "Home",
			routerLink: "/",
		},
	];
}
