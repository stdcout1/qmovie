import { z } from "zod";  

export const signupSchema = z.object({
    username: z.string().min(2, { message: "Username should be atleast 2 characters" }),
    password: z.string().min(2, { message: "Password should be atleast" }),
    confirmPassword: z.string().min(2, { message: "Password is too short" }),
    apiKey: z.string().min(52, { message: "Please enter a valid api key" })

}).superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
        ctx.addIssue({
            code: "custom",
            message: "The passwords did not match",
            path: ['confirmPassword']
        });
    }
});

export const signinSchema = z.object({
    username: z.string().min(2, { message: "Invalid Username" }),
    password: z.string().min(2, { message: "Invalid Password" }),
});
