'use client'
import { signinSchema } from "@/components/formSchemas"
import { signinUser } from "@/components/server/loginUser"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

export default function LoginForm() {
    const processform = async (values: z.infer<typeof signinSchema>) => {
        const message = await signinUser(values);
        form.setError("password", {type: "custom", message: message})
    }
    const form = useForm<z.infer<typeof signinSchema>>({
        resolver: zodResolver(signinSchema),
        mode: "onChange",
        defaultValues: {
            username: "",
            password: "",
        },
    })
    return (
        <Card className="mx-auto max-w-sm my-4">
            <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>
                    Enter your username below to login to your account.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(processform)} className="space-y-3">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-md"> Username </FormLabel>
                                    <FormControl>
                                        <Input placeholder="user123" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-md"> Password </FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button className="w-full">Sign in</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

