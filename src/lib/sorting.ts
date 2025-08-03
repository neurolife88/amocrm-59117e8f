import { PatientData, FieldGroup, SortConfig, FieldGroupSortConfig } from '@/types/patient';

// Конфигурация сортировки по умолчанию для каждой группы полей
export const defaultSortConfig: FieldGroupSortConfig = {
  basic: { field: 'status_name', direction: 'asc' },
  arrival: { field: 'arrival_datetime', direction: 'asc' },
  departure: { field: 'departure_datetime', direction: 'asc' },
  treatment: { field: 'arrival_datetime', direction: 'desc' },
  visa: { field: 'days_until_visa_expires', direction: 'asc' },
  personal: { field: 'patient_last_name', direction: 'asc' }
};

// Функция для получения сортировки по умолчанию для группы полей
export const getDefaultSortForFieldGroup = (fieldGroup: FieldGroup): SortConfig => {
  return defaultSortConfig[fieldGroup];
};

// Функция сортировки пациентов
export const sortPatients = (patients: PatientData[], sortConfig: SortConfig): PatientData[] => {
  const { field, direction } = sortConfig;
  

  

  
     const sortedPatients = [...patients].sort((a, b) => {
     const aValue = a[field];
     const bValue = b[field];
     
     // Обработка null значений
     if (aValue === null && bValue === null) return 0;
     if (aValue === null) return direction === 'asc' ? 1 : -1; // null в конец при asc
     if (bValue === null) return direction === 'asc' ? -1 : 1; // null в конец при asc
    
    // Специальная обработка для status_name
    if (field === 'status_name') {
      const statusOrder = {
        'Билеты куплены': 1,
        'квартира заказана': 2,
        'на лечении': 3,
        'обратные билеты с лечения': 4
      };
      
      const aOrder = statusOrder[aValue as keyof typeof statusOrder] || 999;
      const bOrder = statusOrder[bValue as keyof typeof statusOrder] || 999;
      
      return direction === 'asc' ? aOrder - bOrder : bOrder - aOrder;
    }
    
    // Специальная обработка для дат
    if (field === 'arrival_datetime' || field === 'departure_datetime' || field === 'patient_birthday') {
      const aDate = new Date(aValue as string);
      const bDate = new Date(bValue as string);
      
      if (direction === 'asc') {
        return aDate.getTime() - bDate.getTime();
      } else {
        return bDate.getTime() - aDate.getTime();
      }
    }
    
    // Специальная обработка для числовых полей
    if (field === 'days_until_visa_expires' || field === 'visa_days') {
      // Для визы: null значения (пациенты, которые еще не приехали) идут в конец
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return 1; // null в конец
      if (bValue === null) return -1; // null в конец
      
      const aNum = Number(aValue);
      const bNum = Number(bValue);
      
      if (direction === 'asc') {
        return aNum - bNum;
      } else {
        return bNum - aNum;
      }
    }
    
    // Обычная строковая сортировка
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    
    if (direction === 'asc') {
      return aStr.localeCompare(bStr);
    } else {
      return bStr.localeCompare(aStr);
    }
  });
  
  
  
  return sortedPatients;
};

// Функция для получения отсортированных пациентов с сортировкой по умолчанию для группы полей
export const getSortedPatientsForFieldGroup = (
  patients: PatientData[], 
  fieldGroup: FieldGroup
): PatientData[] => {
  const defaultSort = getDefaultSortForFieldGroup(fieldGroup);
  return sortPatients(patients, defaultSort);
}; 