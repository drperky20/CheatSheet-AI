import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LightbulbIcon, GraduationCap, BookOpen, FileText, CheckCircle2, Link2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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

  const features = [
    {
      icon: <GraduationCap className="h-5 w-5" />,
      title: "Canvas Integration",
      description: "Seamlessly connect to Canvas LMS to access all your courses"
    },
    {
      icon: <LightbulbIcon className="h-5 w-5" />,
      title: "AI-Powered Analysis",
      description: "Google Gemini analyzes assignments to understand requirements"
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Smart Draft Generation",
      description: "Create assignment drafts tailored to your specific requirements"
    },
    {
      icon: <Link2 className="h-5 w-5" />,
      title: "Resource Integration",
      description: "Extract and cite content from external resources automatically"
    }
  ];

  return (
    <div className="min-h-screen bg-background grid md:grid-cols-2">
      {/* Left side - Hero section */}
      <div className="hidden md:flex flex-col bg-gradient-to-br from-primary/5 via-primary/10 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]"></div>
        <div className="relative h-full flex flex-col justify-between z-10 p-8 md:p-12 xl:p-16">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
                <LightbulbIcon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">CheatSheet AI</h1>
            </div>
            
            <div className="space-y-4 mb-8">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                Streamline your <span className="text-primary">academic workflow</span> with AI
              </h2>
              <p className="text-muted-foreground md:text-lg max-w-md">
                CheatSheet AI connects to Canvas and leverages Google Gemini to help you complete assignments more efficiently.
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, idx) => (
                <Card key={idx} className="bg-background/50 backdrop-blur-sm border-primary/10">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-px flex-1 bg-border"></div>
              <p>Powered by Google Gemini AI</p>
              <div className="h-px flex-1 bg-border"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Auth Forms */}
      <div className="flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md mx-auto">
          <div className="md:hidden flex flex-col items-center mb-8 text-center">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-4">
              <LightbulbIcon className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">CheatSheet AI</h1>
            <p className="text-muted-foreground">Your AI-powered assignment companion</p>
          </div>
        
          <Card className="border-muted/40 shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-semibold">Welcome</CardTitle>
              <CardDescription>
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
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
                      
                      <div className="pt-2">
                        <p className="text-xs font-medium text-muted-foreground mb-2">CANVAS INTEGRATION (OPTIONAL)</p>
                        <Separator className="mb-4" />
                      </div>
                      
                      <FormField
                        control={loginForm.control}
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
                        control={loginForm.control}
                        name="canvasToken"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Canvas Access Token</FormLabel>
                            <FormControl>
                              <Input placeholder="Paste your access token" {...field} />
                            </FormControl>
                            <FormDescription>
                              Find this in Canvas: Account &gt; Settings &gt; New Access Token
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full"
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
                      
                      <div className="pt-2">
                        <p className="text-xs font-medium text-muted-foreground mb-2">CANVAS INTEGRATION</p>
                        <Separator className="mb-4" />
                      </div>
                      
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
                            <FormDescription>
                              Find this in Canvas: Account &gt; Settings &gt; New Access Token
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Separator className="mb-4" />
              <Button
                type="button"
                variant="outline"
                className="w-full"
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
          
          <p className="text-center text-sm text-muted-foreground mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}