'use server'

import { signupSchema } from "../formSchemas"
import { z } from "zod"
import { client, lucia } from "@/auth"
import { hash } from "@node-rs/argon2"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const createUser = async (values: z.infer<typeof signupSchema>) => {
    // all inputs are validated here
    const passwordHash = await hash(values.password, {
        // recommended minimum parameters
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1
    });

    const user = await client.user.create({
        data: {
            username: values.username,
            password: passwordHash,
            rdApiKey: values.apiKey
        }
    })

    const session = await lucia.createSession(user.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
    return redirect("/")
}

