
import { useState, useEffect } from 'react';
import { usePatients } from '@/hooks/usePatients';
import { PatientFilters, FieldGroup } from '@/types/patient';
import { FilterPanel } from './FilterPanel';
import { PatientTableDesktop } from './PatientTableDesktop';
import { PatientCardsMobile } from './PatientCardsMobile';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function PatientsTable() {
  const { profile } = useAuth();
  const { patients, loading, error, loadPatients, updatePatient } = usePatients();
  const [isMobile, setIsMobile] = useState(false);
  
  const [filters, setFilters] = useState<PatientFilters>({
    dateRange: 'all',
    status: 'all',
    search: '',
    urgentVisas: false
  });

  const [visibleFieldGroups, setVisibleFieldGroups] = useState<FieldGroup[]>(['basic', 'arrival']);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load patients when filters change
  useEffect(() => {
    if (profile) {
      loadPatients(filters);
    }
  }, [filters, profile, loadPatients]);

  const handleFilterChange = (newFilters: PatientFilters) => {
    setFilters(newFilters);
  };

  const handleFieldGroupToggle = (group: FieldGroup) => {
    setVisibleFieldGroups(prev => 
      prev.includes(group) 
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  if (!profile) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Профиль пользователя не загружен. Попробуйте обновить страницу.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Управление пациентами</h1>
        <p className="text-muted-foreground">
          {profile.role === 'coordinator' 
            ? `Клиника: ${profile.clinic_name}` 
            : 'Все клиники'}
        </p>
      </div>

      {/* Filters */}
      <FilterPanel 
        onFilterChange={handleFilterChange} 
        currentFilters={filters}
      />

      {/* Field Group Toggles */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'basic', label: 'Основное', enabled: true },
          { key: 'arrival', label: 'Прибытие', enabled: true },
          { key: 'departure', label: 'Отъезд', enabled: true },
          { key: 'visa', label: 'Виза', enabled: true },
          { key: 'personal', label: 'Личные данные', enabled: profile.role === 'super_admin' }
        ].filter(group => group.enabled).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleFieldGroupToggle(key as FieldGroup)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              visibleFieldGroups.includes(key as FieldGroup)
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ошибка загрузки данных: {error}
          </AlertDescription>
        </Alert>
      ) : loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Пациенты не найдены</p>
          <p className="text-sm">Попробуйте изменить фильтры поиска</p>
        </div>
      ) : (
        <>
          {isMobile ? (
            <PatientCardsMobile 
              patients={patients}
              visibleFieldGroups={visibleFieldGroups}
              onPatientUpdate={updatePatient}
              userRole={profile.role}
            />
          ) : (
            <PatientTableDesktop 
              patients={patients}
              visibleFieldGroups={visibleFieldGroups}
              onPatientUpdate={updatePatient}
              userRole={profile.role}
            />
          )}
          
          <div className="text-center text-sm text-muted-foreground">
            Найдено пациентов: {patients.length}
          </div>
        </>
      )}
    </div>
  );
}
