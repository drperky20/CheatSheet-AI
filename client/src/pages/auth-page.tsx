import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  canvasUrl: z.string().optional(),
  canvasToken: z.string().optional(),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  canvasUrl: z.string().optional(),
  canvasToken: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { loginMutation, registerMutation, user } = useAuth();
  const [_, navigate] = useLocation();

  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      canvasUrl: "",
      canvasToken: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      canvasUrl: "",
      canvasToken: "",
    },
  });

  function onLoginSubmit(data: LoginFormValues) {
    loginMutation.mutate(data);
  }

  function onRegisterSubmit(data: RegisterFormValues) {
    registerMutation.mutate(data);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-background flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8">
        {/* Hero section */}
        <div className="flex flex-col justify-center p-4">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold font-['Poppins']">CheatSheet AI</h1>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Automate Your Assignments</h2>
          <p className="text-muted-foreground text-lg mb-6">
            CheatSheet AI integrates with Canvas LMS to fetch, analyze, and complete your assignments with AI-powered precision.
          </p>
          <ul className="space-y-3">
            {[
              "Connect to Canvas to access your courses and assignments",
              "AI-powered analysis and draft generation",
              "Extract content from external resources",
              "Edit and submit your work with ease",
            ].map((feature, i) => (
              <li key={i} className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Auth forms */}
        <div>
          <Card className="w-full backdrop-blur-md bg-background/50 border-primary/10">
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Sign in or create an account to connect with Canvas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="canvasUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Canvas URL (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., university.instructure.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="canvasToken"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Canvas Access Token (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Paste your access token" {...field} />
                            </FormControl>
                            <p className="text-xs text-muted-foreground mt-1">
                              Find this in Canvas under Account &gt; Settings &gt; New Access Token
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Create a password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="canvasUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Canvas URL</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., university.instructure.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="canvasToken"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Canvas Access Token</FormLabel>
                            <FormControl>
                              <Input placeholder="Paste your access token" {...field} />
                            </FormControl>
                            <p className="text-xs text-muted-foreground mt-1">
                              Find this in Canvas under Account &gt; Settings &gt; New Access Token
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
