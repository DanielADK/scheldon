-- Vytvoření funkce pro kontrolu teacherId
CREATE OR REPLACE FUNCTION validate_teacher_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."employeeId" IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM "Employees" WHERE "employeeId" = NEW."employeeId" AND "isTeacher" = TRUE) THEN
      RAISE EXCEPTION 'Třídní učitel třídy musí být evidován jako učitel. Tento není.';
END IF;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Vytvoření triggeru pro tabulku Class
DROP TRIGGER IF EXISTS trg_validate_teacher_id ON "Classes";
CREATE TRIGGER trg_validate_teacher_id
    BEFORE INSERT OR UPDATE ON "Classes"
        FOR EACH ROW
        EXECUTE FUNCTION validate_teacher_id();

CREATE OR REPLACE FUNCTION check_unique_employee_username()
    RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM public."Students" WHERE username = NEW.username) THEN
        RAISE EXCEPTION 'Username already exists in Students';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_unique_employee_username
    BEFORE INSERT OR UPDATE ON public."Employees"
    FOR EACH ROW
EXECUTE FUNCTION check_unique_employee_username();

CREATE OR REPLACE FUNCTION check_unique_student_username()
    RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM public."Employees" WHERE username = NEW.username) THEN
        RAISE EXCEPTION 'Username already exists in Employees';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_unique_student_username
    BEFORE INSERT OR UPDATE ON public."Students"
    FOR EACH ROW
EXECUTE FUNCTION check_unique_student_username();

