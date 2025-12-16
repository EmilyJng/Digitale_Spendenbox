import { Injectable, signal } from "@angular/core";

@Injectable({
	providedIn: "root",
})
export class Auth {
	isLoggedIn = signal(false);



	login(username: string, password: string) {
		// Simulate login process
		if (username === "admin" && password === "password") {
			this.isLoggedIn.set(true)
		}
		return this.isLoggedIn;
	}

	logout() {
		this.isLoggedIn.set(false);
	}
}
