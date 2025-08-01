
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Users, Hospital } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
