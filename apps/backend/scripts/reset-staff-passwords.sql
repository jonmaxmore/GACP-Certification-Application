-- Reset all staff passwords to wErew@lf17
-- Bcrypt hash generated with 12 rounds
UPDATE dtam_staff 
SET 
  password = '$2b$12$vhlxMNN2Z3yTVsFmdPNaXu3JP9DR8qNg7rrzz0D44ITWef0K7dI7K',
  "isActive" = true,
  "failedLoginAttempts" = 0,
  "lockedAt" = NULL;
