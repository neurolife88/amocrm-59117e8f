
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon } from 'lucide-react';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Проверяем текущую сессию
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Подписываемся на изменения аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleAuthClick = () => {
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">амосрм</h1>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UserIcon className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <Button onClick={handleSignOut} variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Выйти
                </Button>
              </>
            ) : (
              <Button onClick={handleAuthClick}>
                Войти
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            Добро пожаловать в амосрм
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Система управления лидами и CRM
          </p>
          
          {!user && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Войдите в систему, чтобы начать работу
              </p>
              <Button onClick={handleAuthClick} size="lg">
                Войти в систему
              </Button>
            </div>
          )}

          {user && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Вы вошли в систему как {user.email}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="p-6 border rounded-lg">
                  <h3 className="font-semibold mb-2">Контакты</h3>
                  <p className="text-sm text-muted-foreground">Управление контактами и клиентами</p>
                </div>
                <div className="p-6 border rounded-lg">
                  <h3 className="font-semibold mb-2">Сделки</h3>
                  <p className="text-sm text-muted-foreground">Отслеживание сделок и продаж</p>
                </div>
                <div className="p-6 border rounded-lg">
                  <h3 className="font-semibold mb-2">Аналитика</h3>
                  <p className="text-sm text-muted-foreground">Отчеты и статистика</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
