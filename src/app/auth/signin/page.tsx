'use client';

import { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [showVK, setShowVK] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    // VK кнопка показывается всегда, если VK настроен в production
    setShowVK(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Неверный email или пароль');
      } else {
        // Check user role and redirect accordingly
        const session = await getSession();
        if (session?.user?.role === 'admin' || session?.user?.role === 'super_admin') {
          router.push('/admin');
        } else {
          // Check for callback URL
          const params = new URLSearchParams(window.location.search);
          const callbackUrl = params.get('callbackUrl');
          router.push(callbackUrl || '/account');
        }
      }
    } catch (error) {
      setError('Произошла ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/account' });
  };

  const handleVKSignIn = () => {
    signIn('vk', { callbackUrl: '/account' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Idylle</h1>
          <p className="text-muted-foreground mt-2">Вход в личный кабинет</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Войти</CardTitle>
            <CardDescription>
              Войдите в свой аккаунт, чтобы продолжить
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Войти
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  или
                </span>
              </div>
            </div>

            {isClient && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mb-2"
                  onClick={handleGoogleSignIn}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Войти через Google
                </Button>

                {showVK && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-[#4680C2] text-white hover:bg-[#3d6da8]"
                    onClick={handleVKSignIn}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.785 16.241s.287-.029.434-.175c.135-.133.132-.384.132-.384s-.02-1.196.547-1.375c.557-.176 1.27.875 2.03 1.262.568.287.999.223 1.137-.256.137-.478.137-.959.137-.959l-.017-3.462.024-.12c.048-.172.186-.295.186-.295s1.79-1.653 1.946-2.222c.096-.354-.084-.558-.084-.558s-.479-.134-1.198-.146c-.938-.018-1.946.013-2.264.111-.103.03-.179.103-.179.103s-.322.478-.746.787c-.879.634-1.23.667-1.367.215-.157-.513-1.107-2.129-1.504-2.924-.407-.83-1.14-.835-1.14-.835h-.957s-.738.028-.962.405c-.307.513-.015 1.565-.015 1.565l.745 1.445s.217.488.214.878c-.004.39-.226.571-.293.571-.757.016-2.053-1.002-2.053-1.002s-1.454-.979-2.101-1.468c-.34-.257-.746-.335-.867-.358-.18-.027-.312-.015-.312-.015l-1.001-.007s-.464.303-.424.781c.034.411.322.964.322.964s2.857 4.564 3.194 4.843c.313.262.444.823.831 1.11.386.283.897.365 1.338.266.479-.107 2.695-1.167 2.695-1.167s.626-.55.796-.796c.359-.527.359-1.216.359-1.216z"/>
                    </svg>
                    Войти через VK
                  </Button>
                )}
              </>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Нет аккаунта?{' '}
                <Link href="/auth/signup" className="text-primary hover:underline">
                  Зарегистрироваться
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

