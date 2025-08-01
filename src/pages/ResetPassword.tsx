
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const redirectUrl = `${window.location.origin}/update-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      setError(error.message);
    } else {
      setEmailSent(true);
      toast({
        title: "Email отправлен",
        description: "Проверьте почту для инструкций по сбросу пароля",
      });
    }

    setLoading(false);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                К входу
              </Button>
            </div>
            <CardTitle className="text-2xl text-center">Email отправлен</CardTitle>
            <CardDescription className="text-center">
              Проверьте почту для инструкций по сбросу пароля
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                Мы отправили инструкции по сбросу пароля на адрес <strong>{email}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Если письмо не пришло, проверьте папку "Спам"
              </p>
            </div>
            <Button 
              onClick={() => {
                setEmailSent(false);
                setEmail('');
              }}
              variant="outline" 
              className="w-full"
            >
              Отправить повторно
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              К входу
            </Button>
          </div>
          <CardTitle className="text-2xl text-center">Сброс пароля</CardTitle>
          <CardDescription className="text-center">
            Введите ваш email для получения инструкций по сбросу пароля
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Отправка...' : 'Отправить инструкции'}
            </Button>
            <div className="text-center">
              <Link to="/auth" className="text-sm text-muted-foreground hover:underline">
                Вернуться к входу
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
