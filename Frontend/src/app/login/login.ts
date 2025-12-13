// login.component.ts
import { Component } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { CheckboxModule } from "primeng/checkbox";
import { PasswordModule } from "primeng/password";

@Component({
	selector: "app-login",
	templateUrl: "./login.html",
	styleUrls: ["./login.css"],
	imports: [ButtonModule, CheckboxModule, PasswordModule, CardModule],
})
export class Login {
	loading = false;
	serverError: string | null = null;

	constructor() {}

	async onSubmit() {}

	forgotPassword() {
		// Implement your flow (route, dialog, or service call)
		// e.g., this.router.navigate(['/forgot-password']);
	}
}
