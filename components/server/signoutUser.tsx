'use server'

import { lucia } from "@/auth";
import { cookies } from "next/headers";
import { cache } from "react";
import { validateUser } from "./validateUser";
import { redirect } from "next/navigation";

export const signoutUser = async () => {
	const { session } = await validateUser();
	if (!session) {
		return {
			error: "Unauthorized"
		};
	}

	await lucia.invalidateSession(session.id);

	const sessionCookie = lucia.createBlankSessionCookie();
	cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	return redirect("/login");

}


