
-- Создаем тестовых пользователей с разными ролями
-- Примечание: эти пользователи будут созданы только в таблице профилей
-- Реальная регистрация должна проходить через интерфейс аутентификации

-- Вставляем тестовых пользователей (user_id будет заполнен после реальной регистрации)
INSERT INTO public.user_profiles (user_id, email, full_name, role, clinic_name) VALUES
-- Супер администратор (может видеть все данные)
('00000000-0000-0000-0000-000000000001'::uuid, 'superadmin@test.com', 'Супер Администратор', 'super_admin', NULL),
-- Директор (может видеть данные всех клиник)
('00000000-0000-0000-0000-000000000002'::uuid, 'director@test.com', 'Директор Системы', 'director', NULL),
-- Координаторы разных клиник
('00000000-0000-0000-0000-000000000003'::uuid, 'coordinator1@test.com', 'Координатор Клиники 1', 'coordinator', 'Клиника А'),
('00000000-0000-0000-0000-000000000004'::uuid, 'coordinator2@test.com', 'Координатор Клиники 2', 'coordinator', 'Клиника Б')
ON CONFLICT (user_id) DO NOTHING;

-- Добавляем тестовые данные пациентов для демонстрации
-- Сначала добавим клиники в справочник, если их нет
INSERT INTO clinics_directory (short_name, full_name, address_chinese, address_english) VALUES
('Клиника А', 'Первая медицинская клиника', '北京市朝阳区', 'Beijing, Chaoyang District'),
('Клиника Б', 'Вторая медицинская клиника', '上海市浦东新区', 'Shanghai, Pudong District')
ON CONFLICT DO NOTHING;

-- Добавляем города в справочник
INSERT INTO cities_directory (city_name, airport_code, railway_station_name) VALUES
('Москва', 'SVO', 'Москва-Пассажирская'),
('Санкт-Петербург', 'LED', 'Санкт-Петербург-Главный'),
('Пекин', 'PEK', 'Beijing Railway Station'),
('Шанхай', 'PVG', 'Shanghai Railway Station')
ON CONFLICT DO NOTHING;

-- Добавляем тестовые сделки
INSERT INTO deals (id, lead_id, deal_name, pipeline_name, clinic_name, status_name, country, visa_city) VALUES
(1001, 'LEAD001', 'Лечение пациента Иванов', 'Основной поток', 'Клиника А', 'Новый', 'Россия', 'Москва'),
(1002, 'LEAD002', 'Лечение пациента Петров', 'Основной поток', 'Клиника Б', 'В работе', 'Россия', 'Санкт-Петербург'),
(1003, 'LEAD003', 'Лечение пациента Сидоров', 'Основной поток', 'Клиника А', 'Завершен', 'Россия', 'Москва')
ON CONFLICT DO NOTHING;

-- Добавляем контакты пациентов
INSERT INTO contacts (amocrm_contact_id, deal_id, first_name, last_name, work_phone, work_email, birthday, country, city, passport_number) VALUES
(2001, 1001, 'Иван', 'Иванов', '+7-999-123-4567', 'ivanov@email.com', '1985-05-15', 'Россия', 'Москва', '1234567890'),
(2002, 1002, 'Петр', 'Петров', '+7-999-765-4321', 'petrov@email.com', '1978-08-22', 'Россия', 'Санкт-Петербург', '0987654321'),
(2003, 1003, 'Сидор', 'Сидоров', '+7-999-555-1234', 'sidorov@email.com', '1990-12-10', 'Россия', 'Москва', '5555666777')
ON CONFLICT DO NOTHING;

-- Добавляем билеты в Китай
INSERT INTO tickets_to_china (deal_id, arrival_datetime, transport_type, airport_code, arrival_city, flight_number, terminal, passengers_count, apartment_number) VALUES
(1001, '2024-01-15 14:30:00', 'Самолет', 'PEK', 'Пекин', 'SU204', 'T3', '1', 'А-101'),
(1002, '2024-01-20 09:15:00', 'Самолет', 'PVG', 'Шанхай', 'SU208', 'T2', '1', 'Б-205'),
(1003, '2023-12-10 16:45:00', 'Самолет', 'PEK', 'Пекин', 'SU206', 'T3', '1', 'А-303')
ON CONFLICT DO NOTHING;

-- Добавляем билеты из лечения
INSERT INTO tickets_from_treatment (deal_id, return_transport_type, departure_city, departure_datetime, departure_flight_number) VALUES
(1001, 'Самолет', 'Пекин', '2024-02-15 11:20:00', 'SU205'),
(1002, 'Самолет', 'Шанхай', '2024-02-25 13:45:00', 'SU209'),
(1003, 'Самолет', 'Пекин', '2024-01-10 10:30:00', 'SU207')
ON CONFLICT DO NOTHING;

-- Добавляем визы
INSERT INTO visas (deal_id, visa_type, visa_days, entries_count, corridor_start_date, corridor_end_date) VALUES
(1001, 'Медицинская', 30, 'Однократная', '2024-01-15', '2024-02-14'),
(1002, 'Медицинская', 45, 'Однократная', '2024-01-20', '2024-03-05'),
(1003, 'Медицинская', 30, 'Однократная', '2023-12-10', '2024-01-09')
ON CONFLICT DO NOTHING;
