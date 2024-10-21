'use server'

import { z } from "zod"
import { signinSchema } from "../formSchemas"
import { client, lucia } from "@/auth"
import { equal } from "assert"
import { verify } from "@node-rs/argon2"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const signinUser = async (values: z.infer<typeof signinSchema>) => {
    const existingUser = await client.user.findFirst(
        {
            where:
                { username: { equals: values.username } },
        })
    if (!existingUser) {
        return "Invalid username or password"
    }
    console.log(existingUser.password, values.password)
    const validPassword = await verify(existingUser.password, values.password, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1
    });
    if (!validPassword) {
        return "Invalid username or password"
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    return redirect("/");
}
