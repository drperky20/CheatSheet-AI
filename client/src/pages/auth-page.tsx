import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { LightbulbIcon } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4 pulse">
            <LightbulbIcon className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2 glow-text">CheatSheet AI</h1>
          <p className="text-lg text-white/70">AI-powered assignment assistance</p>
        </div>
        
        <Card className="glass-card border-none overflow-hidden fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-center">Welcome</CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-black/20">
                <TabsTrigger value="login" className="data-[state=active]:bg-primary/30 data-[state=active]:text-white">Sign In</TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-primary/30 data-[state=active]:text-white">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-0">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" className="bg-black/20 border-white/10" {...field} />
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
                            <Input type="password" placeholder="Enter your password" className="bg-black/20 border-white/10" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="canvasUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Canvas URL (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., university.instructure.com" className="bg-black/20 border-white/10" {...field} />
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
                              <Input placeholder="Paste your access token" className="bg-black/20 border-white/10" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full mt-2 bg-primary/80 hover:bg-primary glow-border"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register" className="mt-0">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" className="bg-black/20 border-white/10" {...field} />
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
                            <Input type="password" placeholder="Create a password" className="bg-black/20 border-white/10" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="canvasUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Canvas URL</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., university.instructure.com" className="bg-black/20 border-white/10" {...field} />
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
                              <Input placeholder="Paste your access token" className="bg-black/20 border-white/10" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full mt-2 bg-primary/80 hover:bg-primary glow-border"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex justify-center p-4 bg-black/20">
            <Button
              type="button"
              variant="ghost"
              className="hover-scale glow-text hover:bg-primary/30"
              onClick={() => {
                setActiveTab("register");
                setTimeout(() => {
                  registerForm.setValue("username", "DrPerky");
                  registerForm.setValue("password", "austin09");
                  registerForm.setValue("canvasUrl", "baps.instructure.com");
                  registerForm.setValue("canvasToken", "4732~wuh37m6BJtDDcvM7NhckcfVuE4UvehwVhE4EBRQvUVzHNcCHaWcMB9CND2nCXfaD");
                  registerForm.handleSubmit(onRegisterSubmit)();
                }, 100);
              }}
            >
              Dev Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}