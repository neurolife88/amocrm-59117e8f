
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Users, Hospital, Shield, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, profile, signOut, profileError, refetchProfile } = useAuth();
  const location = useLocation();

  // Debug logging for profile state
  console.log('🏗️ AppLayout render:', { 
    hasUser: !!user, 
    hasProfile: !!profile, 
    profileRole: profile?.role,
    profileError,
    currentPath: location.pathname
  });

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // If user is logged in but no profile, show minimal layout with retry option
  if (user && !profile) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Hospital className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">амосрм</h1>
                <p className="text-sm text-muted-foreground">Система управления пациентами</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                {profileError ? 'Ошибка загрузки профиля' : 'Загрузка профиля...'}
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6">
          <div className="text-center py-8">
            {profileError ? (
              <div className="space-y-4">
                <p className="text-destructive">Ошибка: {profileError}</p>
                <Button onClick={refetchProfile} variant="outline">
                  Попробовать снова
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">Загрузка данных пользователя...</p>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Hospital className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">амосрм</h1>
              <p className="text-sm text-muted-foreground">Система управления пациентами</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {profile.clinic_name && (
              <div className="text-sm">
                <span className="text-muted-foreground">Клиника:</span>{' '}
                <span className="font-medium text-foreground">{profile.clinic_name}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <div className="font-medium text-foreground">{profile.full_name || profile.email}</div>
                <div className="text-muted-foreground capitalize">
                  {profile.role === 'super_admin' ? 'Супер Админ' : 
                   profile.role === 'director' ? 'Директор' : 'Координатор'}
                </div>
              </div>
            </div>
            
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Выйти
            </Button>
          </div>
        </div>
        </header>

        {/* Navigation for Super Admin */}
        {profile.role === 'super_admin' && (
          <nav className="border-b border-border bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="flex space-x-6">
                <Link
                  to="/"
                  className={`flex items-center space-x-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
                    location.pathname === '/'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Дашборд</span>
                </Link>
                <Link
                  to="/users"
                  className={`flex items-center space-x-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
                    location.pathname === '/users'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  <span>Управление пользователями</span>
                </Link>
              </div>
            </div>
          </nav>
        )}


        {/* Main content */}
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
    </div>
  );
}
