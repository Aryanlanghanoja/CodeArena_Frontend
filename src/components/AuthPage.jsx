import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

const AuthPage = () => {
  const { login, register, forgotPassword, error } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    login: false,
    register: false,
    confirm: false
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [devtoolsOpen, setDevtoolsOpen] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    department: 'ICT',
    roll_number: '',
    year_of_study: 1,
    section: 'A',
    phone_no: '',
    designation: ''
  });

  const isDevtoolsOpenNow = () => {
    try {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      return widthThreshold || heightThreshold;
    } catch { return false; }
  };

  useEffect(() => {
    setDevtoolsOpen(isDevtoolsOpenNow());
    const id = setInterval(() => setDevtoolsOpen(isDevtoolsOpenNow()), 1200);
    return () => clearInterval(id);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isDevtoolsOpenNow()) {
      toast({ title: 'Developer tools detected', description: 'Close devtools to continue logging in.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);

    try {
      const result = await login(loginForm);
      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Welcome back to CodeArena!",
        });
        // Redirect to dashboard or home page
        window.location.href = '/';
      } else {
        toast({
          title: "Login Failed",
          description: result.error || "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (isDevtoolsOpenNow()) {
      toast({ title: 'Developer tools detected', description: 'Close devtools to continue registration.', variant: 'destructive' });
      return;
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(registerForm);
      if (result.success) {
        toast({
          title: "Registration Successful",
          description: "Welcome to CodeArena! You can now start solving problems.",
        });
        // Redirect to dashboard or home page
        window.location.href = '/';
      } else {
        toast({
          title: "Registration Failed",
          description: result.error || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsForgotPasswordLoading(true);

    try {
      const result = await forgotPassword(forgotPasswordEmail);
      if (result.success) {
        // For development, show the reset URL if available
        const resetUrl = result.data?.reset_url;
        const description = resetUrl 
          ? `Reset link generated! For development, you can use this link: ${resetUrl}`
          : "If an account with that email exists, you will receive a password reset link shortly.";
        
        toast({
          title: "Reset Link Sent",
          description: description,
        });
        setShowForgotPassword(false);
        setForgotPasswordEmail('');
      } else {
        toast({
          title: "Failed to Send Reset Link",
          description: result.error || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to Send Reset Link",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  const EyeIcon = ({ isVisible, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      aria-label={isVisible ? "Hide password" : "Show password"}
    >
      {isVisible ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {devtoolsOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle>Developer Tools Detected</CardTitle>
              <CardDescription>Close devtools to continue to login or register.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Once devtools is closed, this screen will dismiss automatically.</div>
            </CardContent>
          </Card>
        </div>
      )}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">CodeArena</h1>
          <p className="text-muted-foreground">Competitive Programming Platform</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword.login ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                        className="pr-12"
                      />
                      <EyeIcon
                        isVisible={showPassword.login}
                        onClick={() => togglePasswordVisibility('login')}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                <div className="flex justify-end">
                  <Dialog
                    open={showForgotPassword}
                    onOpenChange={(open) => {
                      setShowForgotPassword(open);
                      if (open) {
                        setForgotPasswordEmail(loginForm.email || '');
                      }
                    }}
                  >
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 text-sm text-muted-foreground hover:text-primary"
                      onClick={() => {
                        setForgotPasswordEmail(loginForm.email || '');
                        setShowForgotPassword(true);
                      }}
                    >
                      Forgot your password?
                    </Button>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                          Enter your email address and we'll send you a link to reset your password.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="forgot-email">Email</Label>
                          <Input
                            id="forgot-email"
                            type="email"
                            placeholder="Enter your email"
                            value={forgotPasswordEmail}
                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowForgotPassword(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isForgotPasswordLoading || !forgotPasswordEmail}>
                            {isForgotPasswordLoading ? "Sending..." : "Send Reset Link"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  {registerForm.role === 'student' && (
                    <div className="space-y-2">
                      <Label htmlFor="register-roll-number">Roll Number</Label>
                      <Input
                        id="register-roll-number"
                        type="text"
                        placeholder="Enter your roll number"
                        value={registerForm.roll_number}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, roll_number: e.target.value }))}
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="register-role">Role</Label>
                    <Select
                      value={registerForm.role}
                      onValueChange={(value) => setRegisterForm(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-department">Department</Label>
                    <Input
                      id="register-department"
                      type="text"
                      placeholder="Enter your department"
                      value={registerForm.department}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, department: e.target.value }))}
                      required
                    />
                  </div>

                  {registerForm.role === 'student' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="register-year">Year of Study</Label>
                        <Select
                          value={registerForm.year_of_study.toString()}
                          onValueChange={(value) => setRegisterForm(prev => ({ ...prev, year_of_study: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1st Year</SelectItem>
                            <SelectItem value="2">2nd Year</SelectItem>
                            <SelectItem value="3">3rd Year</SelectItem>
                            <SelectItem value="4">4th Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-section">Section</Label>
                        <Input
                          id="register-section"
                          type="text"
                          placeholder="Enter your section (e.g., A, B, C)"
                          value={registerForm.section}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, section: e.target.value }))}
                        />
                      </div>
                    </>
                  )}

                  {registerForm.role === 'teacher' && (
                    <div className="space-y-2">
                      <Label htmlFor="register-designation">Designation</Label>
                      <Input
                        id="register-designation"
                        type="text"
                        placeholder="Enter your designation"
                        value={registerForm.designation || ''}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, designation: e.target.value }))}
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="register-phone">Phone Number (Optional)</Label>
                    <Input
                      id="register-phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={registerForm.phone_no}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, phone_no: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showPassword.register ? "text" : "password"}
                        placeholder="Create a password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                        className="pr-12"
                      />
                      <EyeIcon
                        isVisible={showPassword.register}
                        onClick={() => togglePasswordVisibility('register')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="register-confirm-password"
                        type={showPassword.confirm ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                        className="pr-12"
                      />
                      <EyeIcon
                        isVisible={showPassword.confirm}
                        onClick={() => togglePasswordVisibility('confirm')}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;