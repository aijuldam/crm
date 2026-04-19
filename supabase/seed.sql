-- ============================================================
-- CRM Platform — Realistic European Seed Data
-- Markets: NL, FR, DE, ES, IT
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- ─── CRM Users ───────────────────────────────────────────────
INSERT INTO crm_users (id, email, first_name, last_name, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@company.com',     'Admin',    'User',     true),
  ('00000000-0000-0000-0000-000000000002', 'marketing@company.com', 'Sophie',   'Durand',   true),
  ('00000000-0000-0000-0000-000000000003', 'sales@company.com',     'Thomas',   'Müller',   true),
  ('00000000-0000-0000-0000-000000000004', 'nl-lead@company.com',   'Pieter',   'van Dijk', true);

-- ─── Projects ────────────────────────────────────────────────
INSERT INTO projects (id, name, slug, type, default_language, default_country, sending_domain, privacy_notice_version, is_active) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Dutch Market', 'dutch-market', 'b2c', 'nl', 'NL', 'mail.dutchbrand.nl',    '2.1', true),
  ('10000000-0000-0000-0000-000000000002', 'France',       'france',       'b2c', 'fr', 'FR', 'mail.frenchbrand.fr',   '2.0', true),
  ('10000000-0000-0000-0000-000000000003', 'Germany',      'germany',      'b2c', 'de', 'DE', 'mail.germanbrand.de',   '2.2', true),
  ('10000000-0000-0000-0000-000000000004', 'Spain',        'spain',        'b2c', 'es', 'ES', 'mail.spanishbrand.es',  '1.8', true),
  ('10000000-0000-0000-0000-000000000005', 'Italy',        'italy',        'b2c', 'it', 'IT', 'mail.italianbrand.it',  '1.5', false);

-- ─── Memberships ─────────────────────────────────────────────
INSERT INTO memberships (user_id, project_id, role) VALUES
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'admin'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'admin'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'admin'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'admin'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'admin'),
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'marketing'),
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'marketing'),
  ('00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'sales'),
  ('00000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'marketing');

-- ─── Companies ───────────────────────────────────────────────
INSERT INTO companies (id, name, domain, registered_country, billing_country, vat_number, vat_validated_at, industry, company_size) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Janssen & Partners BV',       'janssen-partners.nl',   'NL', 'NL', 'NL123456789B01', '2024-01-15T10:00:00Z', 'Professional Services',   '11-50'),
  ('20000000-0000-0000-0000-000000000002', 'de Vries Retail BV',           'devries-retail.nl',     'NL', 'NL', 'NL987654321B01', '2024-03-01T10:00:00Z', 'Retail & E-commerce',     '51-200'),
  ('20000000-0000-0000-0000-000000000003', 'Martin Conseil SAS',           'martin-conseil.fr',     'FR', 'FR', 'FR12345678901',  '2024-02-01T10:00:00Z', 'Financial Services',      '51-200'),
  ('20000000-0000-0000-0000-000000000004', 'Leblanc & Associés SARL',      'leblanc-associes.fr',   'FR', 'FR', NULL,             NULL,                   'Legal Services',          '1-10'),
  ('20000000-0000-0000-0000-000000000005', 'Schmidt GmbH',                 'schmidt-gmbh.de',       'DE', 'DE', 'DE123456789',   NULL,                   'Manufacturing',           '201-500'),
  ('20000000-0000-0000-0000-000000000006', 'Müller Digital GmbH',          'mueller-digital.de',    'DE', 'DE', 'DE987654321',   '2024-04-15T10:00:00Z', 'SaaS & Technology',       '11-50'),
  ('20000000-0000-0000-0000-000000000007', 'García & Asociados SL',        'garcia-asociados.es',   'ES', 'ES', 'ESB12345678',   '2024-04-01T10:00:00Z', 'Retail & E-commerce',     '11-50'),
  ('20000000-0000-0000-0000-000000000008', 'Ferrari Design SRL',           'ferrari-design.it',     'IT', 'IT', 'IT12345678901', '2024-04-15T10:00:00Z', 'Advertising & Marketing', '1-10');

-- ─── Contacts — Netherlands ───────────────────────────────────
INSERT INTO contacts (id, email, email_normalized, first_name, last_name, phone, country_code, residency_country, preferred_language, timezone, currency, market, lifecycle_stage, source, company_id, created_at) VALUES
  ('30000000-0000-0000-0001-000000000001', 'emma.janssen@gmail.com',       'emma.janssen@gmail.com',       'Emma',    'Janssen',     '+31612345678', 'NL', 'NL', 'nl', 'Europe/Amsterdam', 'EUR', 'NL', 'customer',   'organic_search', '20000000-0000-0000-0000-000000000001', '2024-01-20T10:00:00Z'),
  ('30000000-0000-0000-0001-000000000002', 'lars.devries@xs4all.nl',       'lars.devries@xs4all.nl',       'Lars',    'de Vries',    '+31687654321', 'NL', 'NL', 'nl', 'Europe/Amsterdam', 'EUR', 'NL', 'churned',    'email_campaign', '20000000-0000-0000-0000-000000000002', '2024-02-01T10:00:00Z'),
  ('30000000-0000-0000-0001-000000000003', 'anke.visser@hotmail.nl',       'anke.visser@hotmail.nl',       'Anke',    'Visser',      '+31612398765', 'NL', 'NL', 'nl', 'Europe/Amsterdam', 'EUR', 'NL', 'prospect',   'form',           NULL,                                     '2024-03-05T10:00:00Z'),
  ('30000000-0000-0000-0001-000000000004', 'bert.bakker@outlook.com',      'bert.bakker@outlook.com',      'Bert',    'Bakker',      '+31654321098', 'NL', 'NL', 'nl', 'Europe/Amsterdam', 'EUR', 'NL', 'lead',       'referral',       NULL,                                     '2024-04-10T10:00:00Z'),
  ('30000000-0000-0000-0001-000000000005', 'lotte.smit@gmail.com',         'lotte.smit@gmail.com',         'Lotte',   'Smit',        NULL,           'NL', 'NL', 'nl', 'Europe/Amsterdam', 'EUR', 'NL', 'customer',   'social_media',   '20000000-0000-0000-0000-000000000001', '2024-04-15T10:00:00Z'),
  ('30000000-0000-0000-0001-000000000006', 'koen.meijer@ziggo.nl',         'koen.meijer@ziggo.nl',         'Koen',    'Meijer',      '+31698765432', 'NL', 'NL', 'nl', 'Europe/Amsterdam', 'EUR', 'NL', 'evangelist', 'direct',         NULL,                                     '2024-05-01T10:00:00Z'),
  ('30000000-0000-0000-0001-000000000007', 'noor.peters@yahoo.com',        'noor.peters@yahoo.com',        'Noor',    'Peters',      '+31612345699', 'NL', 'NL', 'nl', 'Europe/Amsterdam', 'EUR', 'NL', 'lead',       'paid_search',    NULL,                                     '2024-05-20T10:00:00Z'),
  ('30000000-0000-0000-0001-000000000008', 'tom.hendrix@gmail.com',        'tom.hendrix@gmail.com',        'Tom',     'Hendrix',     '+31687651234', 'NL', 'NL', 'nl', 'Europe/Amsterdam', 'EUR', 'NL', 'prospect',   'event',          NULL,                                     '2024-06-01T10:00:00Z');

-- ─── Contacts — France ───────────────────────────────────────
INSERT INTO contacts (id, email, email_normalized, first_name, last_name, phone, country_code, residency_country, preferred_language, timezone, currency, market, lifecycle_stage, source, company_id, created_at) VALUES
  ('30000000-0000-0000-0002-000000000001', 'pierre.martin@free.fr',        'pierre.martin@free.fr',        'Pierre',  'Martin',      '+33612345678', 'FR', 'FR', 'fr', 'Europe/Paris', 'EUR', 'FR', 'prospect',  'paid_search',    '20000000-0000-0000-0000-000000000003', '2024-02-15T10:00:00Z'),
  ('30000000-0000-0000-0002-000000000002', 'sophie.lambert@gmail.com',     'sophie.lambert@gmail.com',     'Sophie',  'Lambert',     NULL,           'FR', 'FR', 'fr', 'Europe/Paris', 'EUR', 'FR', 'lead',      'event',          NULL,                                     '2024-05-10T10:00:00Z'),
  ('30000000-0000-0000-0002-000000000003', 'jean.dupont@orange.fr',        'jean.dupont@orange.fr',        'Jean',    'Dupont',      '+33698765432', 'FR', 'FR', 'fr', 'Europe/Paris', 'EUR', 'FR', 'customer',  'organic_search', '20000000-0000-0000-0000-000000000003', '2024-03-01T10:00:00Z'),
  ('30000000-0000-0000-0002-000000000004', 'claire.bernard@gmail.com',     'claire.bernard@gmail.com',     'Claire',  'Bernard',     '+33654321987', 'FR', 'FR', 'fr', 'Europe/Paris', 'EUR', 'FR', 'evangelist','referral',       '20000000-0000-0000-0000-000000000004', '2024-01-25T10:00:00Z'),
  ('30000000-0000-0000-0002-000000000005', 'marc.lefevre@wanadoo.fr',      'marc.lefevre@wanadoo.fr',      'Marc',    'Lefèvre',     '+33612987654', 'FR', 'FR', 'fr', 'Europe/Paris', 'EUR', 'FR', 'prospect',  'social_media',   NULL,                                     '2024-04-05T10:00:00Z'),
  ('30000000-0000-0000-0002-000000000006', 'amelie.roux@gmail.com',        'amelie.roux@gmail.com',        'Amélie',  'Roux',        NULL,           'FR', 'FR', 'fr', 'Europe/Paris', 'EUR', 'FR', 'lead',      'form',           NULL,                                     '2024-06-10T10:00:00Z');

-- ─── Contacts — Germany ──────────────────────────────────────
INSERT INTO contacts (id, email, email_normalized, first_name, last_name, phone, country_code, residency_country, preferred_language, timezone, currency, market, lifecycle_stage, source, company_id, created_at) VALUES
  ('30000000-0000-0000-0003-000000000001', 'anna.schmidt@gmail.com',       'anna.schmidt@gmail.com',       'Anna',    'Schmidt',     '+4915112345678', 'DE', 'DE', 'de', 'Europe/Berlin', 'EUR', 'DE', 'lead',      'form',           '20000000-0000-0000-0000-000000000005', '2024-03-10T10:00:00Z'),
  ('30000000-0000-0000-0003-000000000002', 'max.mueller@web.de',           'max.mueller@web.de',           'Max',     'Müller',      '+4917012345678', 'DE', 'DE', 'de', 'Europe/Berlin', 'EUR', 'DE', 'prospect',  'partner',        '20000000-0000-0000-0000-000000000005', '2024-04-20T10:00:00Z'),
  ('30000000-0000-0000-0003-000000000003', 'lena.bauer@t-online.de',       'lena.bauer@t-online.de',       'Lena',    'Bauer',       '+4916312345678', 'DE', 'DE', 'de', 'Europe/Berlin', 'EUR', 'DE', 'customer',  'organic_search', '20000000-0000-0000-0000-000000000006', '2024-02-10T10:00:00Z'),
  ('30000000-0000-0000-0003-000000000004', 'felix.wagner@gmx.de',          'felix.wagner@gmx.de',          'Felix',   'Wagner',      '+4915512345678', 'DE', 'DE', 'de', 'Europe/Berlin', 'EUR', 'DE', 'evangelist','referral',       '20000000-0000-0000-0000-000000000006', '2024-01-15T10:00:00Z'),
  ('30000000-0000-0000-0003-000000000005', 'sarah.fischer@outlook.de',     'sarah.fischer@outlook.de',     'Sarah',   'Fischer',     NULL,             'DE', 'DE', 'de', 'Europe/Berlin', 'EUR', 'DE', 'lead',      'social_media',   NULL,                                     '2024-06-01T10:00:00Z'),
  ('30000000-0000-0000-0003-000000000006', 'henrik.koeln@gmail.com',       'henrik.koeln@gmail.com',       'Henrik',  'Köln',        '+4917612345678', 'DE', 'DE', 'de', 'Europe/Berlin', 'EUR', 'DE', 'prospect',  'paid_search',    NULL,                                     '2024-05-15T10:00:00Z');

-- ─── Contacts — Spain ────────────────────────────────────────
INSERT INTO contacts (id, email, email_normalized, first_name, last_name, phone, country_code, residency_country, preferred_language, timezone, currency, market, lifecycle_stage, source, company_id, created_at) VALUES
  ('30000000-0000-0000-0004-000000000001', 'carlos.garcia@outlook.es',     'carlos.garcia@outlook.es',     'Carlos',  'García',      '+34612345678', 'ES', 'ES', 'es', 'Europe/Madrid', 'EUR', 'ES', 'customer',  'social_media',   '20000000-0000-0000-0000-000000000007', '2024-03-25T10:00:00Z'),
  ('30000000-0000-0000-0004-000000000002', 'maria.lopez@gmail.com',        'maria.lopez@gmail.com',        'María',   'López',       '+34698765432', 'ES', 'ES', 'es', 'Europe/Madrid', 'EUR', 'ES', 'prospect',  'form',           NULL,                                     '2024-04-01T10:00:00Z'),
  ('30000000-0000-0000-0004-000000000003', 'pablo.rodriguez@hotmail.es',   'pablo.rodriguez@hotmail.es',   'Pablo',   'Rodríguez',   '+34654321987', 'ES', 'ES', 'es', 'Europe/Madrid', 'EUR', 'ES', 'lead',      'organic_search', NULL,                                     '2024-05-10T10:00:00Z'),
  ('30000000-0000-0000-0004-000000000004', 'ana.martinez@gmail.com',       'ana.martinez@gmail.com',       'Ana',     'Martínez',    NULL,           'ES', 'ES', 'es', 'Europe/Madrid', 'EUR', 'ES', 'evangelist','referral',       '20000000-0000-0000-0000-000000000007', '2024-02-20T10:00:00Z'),
  ('30000000-0000-0000-0004-000000000005', 'javier.sanchez@yahoo.es',      'javier.sanchez@yahoo.es',      'Javier',  'Sánchez',     '+34612987654', 'ES', 'ES', 'es', 'Europe/Madrid', 'EUR', 'ES', 'lead',      'paid_search',    NULL,                                     '2024-06-05T10:00:00Z');

-- ─── Contacts — Italy ────────────────────────────────────────
INSERT INTO contacts (id, email, email_normalized, first_name, last_name, phone, country_code, residency_country, preferred_language, timezone, currency, market, lifecycle_stage, source, company_id, created_at) VALUES
  ('30000000-0000-0000-0005-000000000001', 'giulia.ferrari@libero.it',     'giulia.ferrari@libero.it',     'Giulia',  'Ferrari',     '+393331234567', 'IT', 'IT', 'it', 'Europe/Rome', 'EUR', 'IT', 'evangelist','referral',       '20000000-0000-0000-0000-000000000008', '2024-04-01T10:00:00Z'),
  ('30000000-0000-0000-0005-000000000002', 'marco.rossi@gmail.com',        'marco.rossi@gmail.com',        'Marco',   'Rossi',       '+393927654321', 'IT', 'IT', 'it', 'Europe/Rome', 'EUR', 'IT', 'customer',  'organic_search', '20000000-0000-0000-0000-000000000008', '2024-03-15T10:00:00Z'),
  ('30000000-0000-0000-0005-000000000003', 'sofia.bianchi@virgilio.it',    'sofia.bianchi@virgilio.it',    'Sofia',   'Bianchi',     NULL,            'IT', 'IT', 'it', 'Europe/Rome', 'EUR', 'IT', 'lead',      'social_media',   NULL,                                     '2024-05-25T10:00:00Z'),
  ('30000000-0000-0000-0005-000000000004', 'andrea.ricci@hotmail.it',      'andrea.ricci@hotmail.it',      'Andrea',  'Ricci',       '+393451234567', 'IT', 'IT', 'it', 'Europe/Rome', 'EUR', 'IT', 'prospect',  'form',           NULL,                                     '2024-06-08T10:00:00Z');

-- ─── Contact ↔ Project links ──────────────────────────────────
INSERT INTO contact_projects (contact_id, project_id) VALUES
  -- NL contacts → Dutch Market
  ('30000000-0000-0000-0001-000000000001', '10000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0001-000000000002', '10000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0001-000000000003', '10000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0001-000000000004', '10000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0001-000000000005', '10000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0001-000000000006', '10000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0001-000000000007', '10000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0001-000000000008', '10000000-0000-0000-0000-000000000001'),
  -- FR contacts → France
  ('30000000-0000-0000-0002-000000000001', '10000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0002-000000000002', '10000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0002-000000000003', '10000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0002-000000000004', '10000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0002-000000000005', '10000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0002-000000000006', '10000000-0000-0000-0000-000000000002'),
  -- DE contacts → Germany
  ('30000000-0000-0000-0003-000000000001', '10000000-0000-0000-0000-000000000003'),
  ('30000000-0000-0000-0003-000000000002', '10000000-0000-0000-0000-000000000003'),
  ('30000000-0000-0000-0003-000000000003', '10000000-0000-0000-0000-000000000003'),
  ('30000000-0000-0000-0003-000000000004', '10000000-0000-0000-0000-000000000003'),
  ('30000000-0000-0000-0003-000000000005', '10000000-0000-0000-0000-000000000003'),
  ('30000000-0000-0000-0003-000000000006', '10000000-0000-0000-0000-000000000003'),
  -- ES contacts → Spain
  ('30000000-0000-0000-0004-000000000001', '10000000-0000-0000-0000-000000000004'),
  ('30000000-0000-0000-0004-000000000002', '10000000-0000-0000-0000-000000000004'),
  ('30000000-0000-0000-0004-000000000003', '10000000-0000-0000-0000-000000000004'),
  ('30000000-0000-0000-0004-000000000004', '10000000-0000-0000-0000-000000000004'),
  ('30000000-0000-0000-0004-000000000005', '10000000-0000-0000-0000-000000000004'),
  -- IT contacts → Italy
  ('30000000-0000-0000-0005-000000000001', '10000000-0000-0000-0000-000000000005'),
  ('30000000-0000-0000-0005-000000000002', '10000000-0000-0000-0000-000000000005'),
  ('30000000-0000-0000-0005-000000000003', '10000000-0000-0000-0000-000000000005'),
  ('30000000-0000-0000-0005-000000000004', '10000000-0000-0000-0000-000000000005');

-- ─── Lists ───────────────────────────────────────────────────
INSERT INTO lists (id, project_id, name, description, is_active) VALUES
  ('40000000-0000-0000-0001-000000000001', '10000000-0000-0000-0000-000000000001', 'Newsletter NL',       'Dutch language newsletter subscribers',                  true),
  ('40000000-0000-0000-0001-000000000002', '10000000-0000-0000-0000-000000000001', 'Promo NL',            'Opted in to promotional emails (NL)',                    true),
  ('40000000-0000-0000-0001-000000000003', '10000000-0000-0000-0000-000000000001', 'Winback NL',          'Churned customers - re-engagement target',               true),
  ('40000000-0000-0000-0002-000000000001', '10000000-0000-0000-0000-000000000002', 'Newsletter FR',       'French language newsletter subscribers',                  true),
  ('40000000-0000-0000-0002-000000000002', '10000000-0000-0000-0000-000000000002', 'Promo FR',            'Opted in to promotional emails (FR)',                    true),
  ('40000000-0000-0000-0003-000000000001', '10000000-0000-0000-0000-000000000003', 'Newsletter DE',       'German language newsletter subscribers',                  true),
  ('40000000-0000-0000-0003-000000000002', '10000000-0000-0000-0000-000000000003', 'Promo DE',            'Opted in to promotional emails (DE)',                    true),
  ('40000000-0000-0000-0004-000000000001', '10000000-0000-0000-0000-000000000004', 'Newsletter ES',       'Spanish language newsletter subscribers',                 true),
  ('40000000-0000-0000-0005-000000000001', '10000000-0000-0000-0000-000000000005', 'Newsletter IT',       'Italian language newsletter subscribers',                 false);

-- ─── Contact ↔ List ──────────────────────────────────────────
INSERT INTO contact_lists (contact_id, list_id) VALUES
  -- NL newsletter
  ('30000000-0000-0000-0001-000000000001', '40000000-0000-0000-0001-000000000001'),
  ('30000000-0000-0000-0001-000000000003', '40000000-0000-0000-0001-000000000001'),
  ('30000000-0000-0000-0001-000000000005', '40000000-0000-0000-0001-000000000001'),
  ('30000000-0000-0000-0001-000000000006', '40000000-0000-0000-0001-000000000001'),
  -- NL promo
  ('30000000-0000-0000-0001-000000000001', '40000000-0000-0000-0001-000000000002'),
  ('30000000-0000-0000-0001-000000000005', '40000000-0000-0000-0001-000000000002'),
  -- NL winback
  ('30000000-0000-0000-0001-000000000002', '40000000-0000-0000-0001-000000000003'),
  -- FR newsletter
  ('30000000-0000-0000-0002-000000000001', '40000000-0000-0000-0002-000000000001'),
  ('30000000-0000-0000-0002-000000000003', '40000000-0000-0000-0002-000000000001'),
  ('30000000-0000-0000-0002-000000000004', '40000000-0000-0000-0002-000000000001'),
  -- DE newsletter
  ('30000000-0000-0000-0003-000000000001', '40000000-0000-0000-0003-000000000001'),
  ('30000000-0000-0000-0003-000000000002', '40000000-0000-0000-0003-000000000001'),
  ('30000000-0000-0000-0003-000000000003', '40000000-0000-0000-0003-000000000001'),
  ('30000000-0000-0000-0003-000000000004', '40000000-0000-0000-0003-000000000001'),
  -- ES newsletter
  ('30000000-0000-0000-0004-000000000001', '40000000-0000-0000-0004-000000000001'),
  ('30000000-0000-0000-0004-000000000004', '40000000-0000-0000-0004-000000000001');

-- ─── Segments ────────────────────────────────────────────────
INSERT INTO segments (project_id, name, description, conditions, is_active) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Active NL Customers',  'Customers in Netherlands', '[{"field":"lifecycle_stage","operator":"equals","value":"customer"},{"field":"residency_country","operator":"equals","value":"NL"}]', true),
  ('10000000-0000-0000-0000-000000000001', 'NL Evangelists',       'Brand advocates in NL',   '[{"field":"lifecycle_stage","operator":"equals","value":"evangelist"},{"field":"residency_country","operator":"equals","value":"NL"}]', true),
  ('10000000-0000-0000-0000-000000000001', 'At-Risk NL',           'Churned NL contacts',     '[{"field":"lifecycle_stage","operator":"equals","value":"churned"},{"field":"residency_country","operator":"equals","value":"NL"}]', true),
  ('10000000-0000-0000-0000-000000000002', 'FR Prospects',         'Prospects in France',     '[{"field":"lifecycle_stage","operator":"equals","value":"prospect"},{"field":"residency_country","operator":"equals","value":"FR"}]', true),
  ('10000000-0000-0000-0000-000000000002', 'FR Customers',         'Customers in France',     '[{"field":"lifecycle_stage","operator":"equals","value":"customer"},{"field":"residency_country","operator":"equals","value":"FR"}]', true),
  ('10000000-0000-0000-0000-000000000003', 'DE Customers',         'Customers in Germany',    '[{"field":"lifecycle_stage","operator":"equals","value":"customer"},{"field":"residency_country","operator":"equals","value":"DE"}]', true),
  ('10000000-0000-0000-0000-000000000004', 'ES Evangelists',       'Brand advocates in ES',   '[{"field":"lifecycle_stage","operator":"equals","value":"evangelist"},{"field":"residency_country","operator":"equals","value":"ES"}]', true);

-- ─── Forms ───────────────────────────────────────────────────
INSERT INTO forms (project_id, name, slug, fields, settings, is_active) VALUES
  ('10000000-0000-0000-0000-000000000001', 'NL Newsletter Signup', 'nl-newsletter',
   '[{"id":"f1","type":"email","label":"E-mailadres","name":"email","required":true,"maps_to":"email"},{"id":"f2","type":"text","label":"Voornaam","name":"first_name","required":false,"maps_to":"first_name"},{"id":"f3","type":"checkbox","label":"Ik ga akkoord met de privacyverklaring","name":"consent","required":true}]',
   '{"redirect_url":"/nl/bedankt","send_confirmation":true}', true),
  ('10000000-0000-0000-0000-000000000002', 'FR Newsletter Signup', 'fr-newsletter',
   '[{"id":"f1","type":"email","label":"Adresse e-mail","name":"email","required":true,"maps_to":"email"},{"id":"f2","type":"text","label":"Prénom","name":"first_name","required":false,"maps_to":"first_name"},{"id":"f3","type":"checkbox","label":"J'\''accepte la politique de confidentialité","name":"consent","required":true}]',
   '{"redirect_url":"/fr/merci","send_confirmation":true}', true),
  ('10000000-0000-0000-0000-000000000003', 'DE Newsletter Signup', 'de-newsletter',
   '[{"id":"f1","type":"email","label":"E-Mail-Adresse","name":"email","required":true,"maps_to":"email"},{"id":"f2","type":"text","label":"Vorname","name":"first_name","required":false,"maps_to":"first_name"},{"id":"f3","type":"checkbox","label":"Ich stimme der Datenschutzerklärung zu","name":"consent","required":true}]',
   '{"redirect_url":"/de/danke","send_confirmation":true}', true),
  ('10000000-0000-0000-0000-000000000004', 'ES Newsletter Signup', 'es-newsletter',
   '[{"id":"f1","type":"email","label":"Correo electrónico","name":"email","required":true,"maps_to":"email"},{"id":"f2","type":"text","label":"Nombre","name":"first_name","required":false,"maps_to":"first_name"},{"id":"f3","type":"checkbox","label":"Acepto la política de privacidad","name":"consent","required":true}]',
   '{"redirect_url":"/es/gracias","send_confirmation":true}', true);

-- ─── Consents ────────────────────────────────────────────────
INSERT INTO consents (contact_id, project_id, list_id, channel, purpose, consent_status, legal_basis, consent_country, consent_language, consent_text_version, privacy_notice_version, source_page, consented_at) VALUES
  -- NL opted in
  ('30000000-0000-0000-0001-000000000001', '10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0001-000000000001', 'email', 'newsletter', 'opted_in',     'consent', 'NL', 'nl', '1.2', '2.1', '/nl/inschrijven', '2024-01-20T10:00:00Z'),
  ('30000000-0000-0000-0001-000000000003', '10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0001-000000000001', 'email', 'newsletter', 'opted_in',     'consent', 'NL', 'nl', '1.2', '2.1', '/nl/inschrijven', '2024-03-05T10:00:00Z'),
  ('30000000-0000-0000-0001-000000000005', '10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0001-000000000001', 'email', 'newsletter', 'opted_in',     'consent', 'NL', 'nl', '1.2', '2.1', '/nl/inschrijven', '2024-04-15T10:00:00Z'),
  ('30000000-0000-0000-0001-000000000006', '10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0001-000000000001', 'email', 'newsletter', 'opted_in',     'consent', 'NL', 'nl', '1.2', '2.1', '/nl/inschrijven', '2024-05-01T10:00:00Z'),
  -- NL unsubscribed / opted out
  ('30000000-0000-0000-0001-000000000002', '10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0001-000000000001', 'email', 'newsletter', 'unsubscribed', 'consent', 'NL', 'nl', '1.0', '2.0', '/nl/inschrijven', '2024-02-01T10:00:00Z'),
  -- FR consents
  ('30000000-0000-0000-0002-000000000001', '10000000-0000-0000-0000-000000000002', '40000000-0000-0000-0002-000000000001', 'email', 'newsletter', 'opted_in',     'consent', 'FR', 'fr', '1.0', '2.0', '/fr/inscription', '2024-02-15T10:00:00Z'),
  ('30000000-0000-0000-0002-000000000003', '10000000-0000-0000-0000-000000000002', '40000000-0000-0000-0002-000000000001', 'email', 'newsletter', 'opted_in',     'consent', 'FR', 'fr', '1.0', '2.0', '/fr/inscription', '2024-03-01T10:00:00Z'),
  ('30000000-0000-0000-0002-000000000004', '10000000-0000-0000-0000-000000000002', '40000000-0000-0000-0002-000000000001', 'email', 'newsletter', 'opted_in',     'consent', 'FR', 'fr', '1.0', '2.0', '/fr/inscription', '2024-01-25T10:00:00Z'),
  ('30000000-0000-0000-0002-000000000002', '10000000-0000-0000-0000-000000000002', NULL,                                   'email', 'newsletter', 'pending',      'consent', 'FR', 'fr', '1.0', '2.0', '/fr/inscription', NULL),
  -- DE consents (double opt-in culture — more pending)
  ('30000000-0000-0000-0003-000000000001', '10000000-0000-0000-0000-000000000003', '40000000-0000-0000-0003-000000000001', 'email', 'newsletter', 'pending',      'consent', 'DE', 'de', '1.1', '2.2', '/de/anmelden', NULL),
  ('30000000-0000-0000-0003-000000000002', '10000000-0000-0000-0000-000000000003', '40000000-0000-0000-0003-000000000001', 'email', 'newsletter', 'opted_in',     'consent', 'DE', 'de', '1.1', '2.2', '/de/anmelden', '2024-04-20T10:00:00Z'),
  ('30000000-0000-0000-0003-000000000003', '10000000-0000-0000-0000-000000000003', '40000000-0000-0000-0003-000000000001', 'email', 'newsletter', 'opted_in',     'consent', 'DE', 'de', '1.1', '2.2', '/de/anmelden', '2024-02-10T10:00:00Z'),
  ('30000000-0000-0000-0003-000000000004', '10000000-0000-0000-0000-000000000003', '40000000-0000-0000-0003-000000000001', 'email', 'newsletter', 'opted_in',     'consent', 'DE', 'de', '1.1', '2.2', '/de/anmelden', '2024-01-15T10:00:00Z'),
  -- ES consents
  ('30000000-0000-0000-0004-000000000001', '10000000-0000-0000-0000-000000000004', '40000000-0000-0000-0004-000000000001', 'email', 'newsletter', 'opted_in',     'consent', 'ES', 'es', '1.0', '1.8', '/es/suscribirse', '2024-03-25T10:00:00Z'),
  ('30000000-0000-0000-0004-000000000004', '10000000-0000-0000-0000-000000000004', '40000000-0000-0000-0004-000000000001', 'email', 'newsletter', 'opted_in',     'consent', 'ES', 'es', '1.0', '1.8', '/es/suscribirse', '2024-02-20T10:00:00Z'),
  ('30000000-0000-0000-0004-000000000002', '10000000-0000-0000-0000-000000000004', NULL,                                   'email', 'newsletter', 'pending',      'consent', 'ES', 'es', '1.0', '1.8', '/es/suscribirse', NULL);

-- ─── Activities ──────────────────────────────────────────────
INSERT INTO activities (contact_id, project_id, type, subject, metadata, created_at) VALUES
  ('30000000-0000-0000-0001-000000000001', '10000000-0000-0000-0000-000000000001', 'form_submitted', 'NL Newsletter Signup',         '{"form_slug":"nl-newsletter"}', '2024-01-20T10:00:00Z'),
  ('30000000-0000-0000-0001-000000000001', '10000000-0000-0000-0000-000000000001', 'list_added',     'Added to Newsletter NL',        '{"list_id":"40000000-0000-0000-0001-000000000001"}', '2024-01-20T10:05:00Z'),
  ('30000000-0000-0000-0001-000000000001', '10000000-0000-0000-0000-000000000001', 'consent_updated','Email consent: opted_in',       '{"channel":"email","status":"opted_in"}', '2024-01-20T10:06:00Z'),
  ('30000000-0000-0000-0002-000000000001', '10000000-0000-0000-0000-000000000002', 'form_submitted', 'FR Newsletter Signup',          '{"form_slug":"fr-newsletter"}', '2024-02-15T10:00:00Z'),
  ('30000000-0000-0000-0002-000000000001', '10000000-0000-0000-0000-000000000002', 'list_added',     'Added to Newsletter FR',        '{"list_id":"40000000-0000-0000-0002-000000000001"}', '2024-02-15T10:05:00Z'),
  ('30000000-0000-0000-0001-000000000002', '10000000-0000-0000-0000-000000000001', 'consent_updated','Email consent: unsubscribed',   '{"channel":"email","status":"unsubscribed"}', '2024-04-10T10:00:00Z');

-- ─── Tasks ───────────────────────────────────────────────────
INSERT INTO tasks (contact_id, title, status, priority, due_date, assigned_to, created_by) VALUES
  ('30000000-0000-0000-0001-000000000002', 'Call Lars — discuss re-engagement offer', 'todo',        'high',   '2026-05-15T09:00:00Z', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0002-000000000001', 'Send Pierre updated product catalogue',   'in_progress', 'medium', '2026-05-20T09:00:00Z', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0003-000000000001', 'Verify Anna consent double opt-in',       'todo',        'high',   '2026-05-10T09:00:00Z', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001');
