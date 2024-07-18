-- Vytvoření funkce pro kontrolu teacherId
DELIMITER //

CREATE TRIGGER trg_validate_teacher_id
    BEFORE INSERT ON Classes
    FOR EACH ROW
BEGIN
    DECLARE teacher_exists INT;
    IF NEW.employeeId IS NOT NULL THEN
        SET teacher_exists = (SELECT COUNT(*) FROM Employees WHERE employeeId = NEW.employeeId AND isTeacher = TRUE);
        IF teacher_exists = 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Třídní učitel třídy musí být evidován jako učitel. Tento není.';
        END IF;
    END IF;
END //

DELIMITER ;

-- Kontrola unikátního username v Employees
DELIMITER //

CREATE TRIGGER trg_unique_employee_username
    BEFORE INSERT ON Employees
    FOR EACH ROW
BEGIN
    DECLARE username_exists INT;
    SET username_exists = (SELECT COUNT(*) FROM Students WHERE username = NEW.username);
    IF username_exists > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Username already exists in Students';
    END IF;
END //

DELIMITER ;

-- Kontrola unikátního username ve Students
DELIMITER //

CREATE TRIGGER trg_unique_student_username
    BEFORE INSERT ON Students
    FOR EACH ROW
BEGIN
    DECLARE username_exists INT;
    SET username_exists = (SELECT COUNT(*) FROM Employees WHERE username = NEW.username);
    IF username_exists > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Username already exists in Employees';
    END IF;
END //

DELIMITER ;

-- Vytvoření triggeru pro tabulku StudentAssignments
DELIMITER //

CREATE TRIGGER validate_student_assignment_trigger
    BEFORE INSERT ON StudentAssignments
    FOR EACH ROW
BEGIN
    DECLARE class_exists INT;
    DECLARE subclass_exists INT;

    SET class_exists = (SELECT COUNT(*) FROM Classes WHERE classId = NEW.classId);
    IF class_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Class does not exist';
    END IF;

    IF NEW.subClassId IS NOT NULL THEN
        SET subclass_exists = (SELECT COUNT(*) FROM SubClasses WHERE subClassId = NEW.subClassId);
        IF subclass_exists = 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'SubClass does not exist';
        END IF;
    END IF;
END //

DELIMITER ;
