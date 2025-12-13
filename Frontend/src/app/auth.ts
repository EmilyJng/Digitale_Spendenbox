import { Injectable } from "@angular/core";

@Injectable({
	providedIn: "root",
})
export class Auth {
	isLoggedIn = false;

	login(username: string, password: string) {
		// Simulate login process
		if (username === "admin" && password === "password") {
			this.isLoggedIn = true;
		}
	}

	logout() {
		this.isLoggedIn = false;
	}
}
