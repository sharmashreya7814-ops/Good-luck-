-- ==============================================================================
-- Good Luck Hair Salon - PostgreSQL Production Database Schema
-- Version: 1.0.0
-- ==============================================================================

-- 1. Create Enums / Custom Types
CREATE TYPE appointment_status AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');
CREATE TYPE location_type AS ENUM ('SALON', 'HOME');
CREATE TYPE service_category AS ENUM ('hair', 'beard', 'massage', 'other');

-- 2. Services Table
CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category service_category NOT NULL DEFAULT 'hair',
    description TEXT NOT NULL,
    price VARCHAR(64) NOT NULL, -- e.g., '₹150' or indicative placeholder
    duration INTEGER NOT NULL CHECK (duration > 0), -- duration in minutes
    home_service_available BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    is_popular BOOLEAN NOT NULL DEFAULT FALSE,
    tagline VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Staff Table (Salon operates with 2 chairs / service providers)
CREATE TABLE IF NOT EXISTS staff (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    title VARCHAR(100) DEFAULT 'Service Professional',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Business Settings Table (Singleton configuration)
CREATE TABLE IF NOT EXISTS business_settings (
    id VARCHAR(32) PRIMARY KEY DEFAULT 'default_config',
    opening_time VARCHAR(5) NOT NULL DEFAULT '09:00',      -- 'HH:mm'
    closing_time VARCHAR(5) NOT NULL DEFAULT '21:00',      -- 'HH:mm'
    break_start VARCHAR(5) NOT NULL DEFAULT '14:00',       -- 'HH:mm'
    break_end VARCHAR(5) NOT NULL DEFAULT '15:00',         -- 'HH:mm'
    saturday_closing_time VARCHAR(5) NOT NULL DEFAULT '14:00', -- 'HH:mm' (Half day)
    staff_count INTEGER NOT NULL DEFAULT 2 CHECK (staff_count >= 1),
    home_service_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    slot_interval_minutes INTEGER NOT NULL DEFAULT 30 CHECK (slot_interval_minutes >= 15),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(64) PRIMARY KEY,
    booking_reference VARCHAR(32) UNIQUE NOT NULL,         -- e.g., 'GLS-8492'
    customer_name VARCHAR(150) NOT NULL,
    mobile VARCHAR(20) NOT NULL,                           -- 10-digit Indian mobile
    service_id VARCHAR(64) NOT NULL REFERENCES services(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    staff_id VARCHAR(64) REFERENCES staff(id) ON UPDATE CASCADE ON DELETE SET NULL,
    location_type location_type NOT NULL DEFAULT 'SALON',
    address TEXT,                                          -- required if location_type = 'HOME'
    locality VARCHAR(150),                                 -- required if location_type = 'HOME'
    appointment_date DATE NOT NULL,                        -- YYYY-MM-DD
    start_time VARCHAR(5) NOT NULL,                        -- 'HH:mm'
    end_time VARCHAR(5) NOT NULL,                          -- 'HH:mm'
    notes TEXT,
    status appointment_status NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Table Constraints
    CONSTRAINT chk_home_address CHECK (
        (location_type = 'SALON') OR 
        (location_type = 'HOME' AND address IS NOT NULL AND length(trim(address)) > 0)
    )
);

-- ==============================================================================
-- Indexes for Performance & Query Optimization
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_appointments_date_time 
    ON appointments (appointment_date, start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_appointments_staff_date 
    ON appointments (staff_id, appointment_date, status);

CREATE INDEX IF NOT EXISTS idx_appointments_booking_ref 
    ON appointments (booking_reference);

CREATE INDEX IF NOT EXISTS idx_appointments_status 
    ON appointments (status);

CREATE INDEX IF NOT EXISTS idx_services_active_category 
    ON services (active, category);

-- ==============================================================================
-- Initial Seed Data
-- ==============================================================================

-- Seed Business Settings
INSERT INTO business_settings (
    id, opening_time, closing_time, break_start, break_end, 
    saturday_closing_time, staff_count, home_service_enabled, slot_interval_minutes
) VALUES (
    'default_config', '09:00', '21:00', '14:00', '15:00', 
    '14:00', 2, TRUE, 30
) ON CONFLICT (id) DO UPDATE SET
    opening_time = EXCLUDED.opening_time,
    closing_time = EXCLUDED.closing_time,
    break_start = EXCLUDED.break_start,
    break_end = EXCLUDED.break_end,
    saturday_closing_time = EXCLUDED.saturday_closing_time,
    staff_count = EXCLUDED.staff_count,
    home_service_enabled = EXCLUDED.home_service_enabled,
    updated_at = CURRENT_TIMESTAMP;

-- Seed Staff (2 Dedicated Chairs)
INSERT INTO staff (id, name, title, active) VALUES
    ('staff-1', 'Founder & Senior Barber', 'Proprietor & Senior Barber', TRUE),
    ('staff-2', 'Associate Barber & Groomer', 'Senior Styling Associate', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Seed Core Services
INSERT INTO services (id, name, category, description, price, duration, home_service_available, active, is_popular, tagline) VALUES
    ('classic-haircut', 'Classic Haircut & Styling', 'hair', 'Traditional scissor cut and neat neck contouring tailored to hair growth patterns.', '₹150 (Placeholder)', 30, TRUE, TRUE, TRUE, 'Scissor precision and disciplined finishing'),
    ('beard-grooming', 'Beard Trim & Clean Lines', 'beard', 'Precision beard sculpting, symmetry balance, clean trimmer edging, and herbal oil.', '₹100 (Placeholder)', 20, TRUE, TRUE, TRUE, 'Sharp contouring tailored to your face structure'),
    ('head-massage-champi', 'Head Massage (Champi)', 'massage', 'Traditional scalp champi with pressure-point relaxation to soothe everyday tension.', '₹120 (Placeholder)', 25, TRUE, TRUE, TRUE, 'Traditional acupressure for mental clarity'),
    ('shave-hot-towel', 'Clean Shave & Hot Towel', 'beard', 'Softening lather, classic straight-edge blade shaving, warm towel, and soothing balm.', '₹80 (Placeholder)', 25, TRUE, TRUE, FALSE, 'Clean, comfortable grooming'),
    ('body-shoulder-massage', 'Upper Body & Shoulder Massage', 'massage', 'Focused neck, shoulder, and back tension release using unhurried manual techniques.', '₹250 (Placeholder)', 35, FALSE, TRUE, TRUE, 'Calibrated pressure for tired muscles'),
    ('hair-color-application', 'Hair & Beard Color Touch-up', 'other', 'Even grey coverage using gentle formulations with minimal scalp tingling.', '₹200 (Placeholder)', 40, TRUE, TRUE, FALSE, 'Natural-looking tone and thorough wash')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    duration = EXCLUDED.duration,
    home_service_available = EXCLUDED.home_service_available,
    active = EXCLUDED.active,
    is_popular = EXCLUDED.is_popular,
    tagline = EXCLUDED.tagline,
    updated_at = CURRENT_TIMESTAMP;

-- ==============================================================================
-- 6. Images Table (Admin Media Management)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS images (
    id VARCHAR(64) PRIMARY KEY,
    slot VARCHAR(32) NOT NULL,                                -- 'HERO', 'ABOUT', 'GALLERY', 'SERVICE', 'LOGO'
    service_id VARCHAR(64) REFERENCES services(id) ON UPDATE CASCADE ON DELETE SET NULL,
    storage_key VARCHAR(255) NOT NULL,
    public_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255) NOT NULL,
    mime_type VARCHAR(64),
    file_size INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_images_slot_active 
    ON images (slot, is_active);

CREATE INDEX IF NOT EXISTS idx_images_service 
    ON images (service_id);

