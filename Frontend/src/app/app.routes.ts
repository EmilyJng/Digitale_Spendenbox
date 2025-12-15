import type { Routes } from "@angular/router";
import { Home } from "./home/home";
import { Login } from "./login/login";
import { Dashboard } from "./dashboard/dashboard";

export const routes: Routes = [
	{
		path: "",
		component: Home,
	},
	{
		path: "login",
		component: Login,
	},
	{
		path: "dashboard",
		component: Dashboard,
	},
];
