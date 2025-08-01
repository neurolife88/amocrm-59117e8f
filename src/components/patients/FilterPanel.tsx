
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Calendar, AlertTriangle, Building } from 'lucide-react';
import { PatientFilters } from '@/types/patient';
import { useAuth } from '@/hooks/useAuth';

interface FilterPanelProps {
  onFilterChange: (filters: PatientFilters) => void;
  currentFilters: PatientFilters;
}

export function FilterPanel({ onFilterChange, currentFilters }: FilterPanelProps) {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState(currentFilters.search || '');

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onFilterChange({ ...currentFilters, search: value });
  };

  const handleDateRangeChange = (dateRange: PatientFilters['dateRange']) => {
    onFilterChange({ ...currentFilters, dateRange });
  };

  const handleStatusChange = (status: PatientFilters['status']) => {
    onFilterChange({ ...currentFilters, status });
  };

  const handleUrgentVisasToggle = () => {
    onFilterChange({ ...currentFilters, urgentVisas: !currentFilters.urgentVisas });
  };

  const resetFilters = () => {
    const resetFilters: PatientFilters = {
      dateRange: 'all',
      status: 'all',
      search: '',
      urgentVisas: false
    };
    setSearchTerm('');
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Поиск пациентов..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Date Range Filters */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Период:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'today', label: 'Сегодня' },
            { key: 'tomorrow', label: 'Завтра' },
            { key: 'week', label: 'Неделя' },
            { key: 'all', label: 'Все' }
          ].map(({ key, label }) => (
            <Button
              key={key}
              variant={currentFilters.dateRange === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDateRangeChange(key as PatientFilters['dateRange'])}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Status Filters */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Статус:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Все' },
            { key: 'arriving', label: 'Прибывают' },
            { key: 'in_treatment', label: 'На лечении' },
            { key: 'departing', label: 'Отбывают' }
          ].map(({ key, label }) => (
            <Button
              key={key}
              variant={currentFilters.status === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusChange(key as PatientFilters['status'])}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Urgent Visas Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <span className="text-sm font-medium">Срочные визы</span>
        </div>
        <Button
          variant={currentFilters.urgentVisas ? 'default' : 'outline'}
          size="sm"
          onClick={handleUrgentVisasToggle}
        >
          {currentFilters.urgentVisas ? 'Включено' : 'Выключено'}
        </Button>
      </div>

      {/* Reset Button */}
      <div className="pt-2 border-t border-border">
        <Button variant="ghost" size="sm" onClick={resetFilters} className="w-full">
          Сбросить фильтры
        </Button>
      </div>
    </div>
  );
}
