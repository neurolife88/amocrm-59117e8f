import { useState } from 'react';
import { AlertTriangle, Mail, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function EmailVerificationAlert() {
  const { user, resendVerificationEmail } = useAuth();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(true);

  const handleResendEmail = async () => {
    try {
      setIsResending(true);
      await resendVerificationEmail();
      
      toast({
        title: "Письмо отправлено",
        description: "Проверьте свою почту для подтверждения аккаунта.",
      });

      setCanResend(false);
      // Allow resending again after 60 seconds
      setTimeout(() => setCanResend(true), 60000);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить письмо. Попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
          <CardTitle>Подтвердите свой email</CardTitle>
          <CardDescription>
            Для доступа к системе необходимо подтвердить адрес электронной почты
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertTitle>Письмо отправлено</AlertTitle>
            <AlertDescription>
              Мы отправили письмо с подтверждением на адрес{' '}
              <strong>{user?.email}</strong>. Перейдите по ссылке в письме для активации аккаунта.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Button
              onClick={handleResendEmail}
              disabled={!canResend || isResending}
              className="w-full"
              variant="outline"
            >
              {isResending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              {isResending ? 'Отправляем...' : canResend ? 'Отправить письмо повторно' : 'Письмо отправлено'}
            </Button>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>Не получили письмо?</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Проверьте папку "Спам" или "Нежелательная почта"</li>
                <li>Убедитесь, что адрес введен правильно</li>
                <li>Подождите несколько минут - доставка может занять время</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}