# Scheldon – School Information System

## Project Overview

Scheldon is a local-deployable information system for schools, designed to manage student and staff data, class registers, attendance, and timetables via a unified RESTful API. It streamlines administrative workflows and supports integration with external systems.
## 🚀 Key Features

- **Student & Staff Management:** CRUD operations for student and employee records.
- **Class Registers & Attendance:** Record lesson details and track absences.
- **Timetable & Room Scheduling:** Define class schedules, handle substitutions, and prevent conflicts.
- **REST API & Swagger UI:** Comprehensive OpenAPI docs for easy integration.

## 🔧 Technology Stack

- **Node.js & Koa:** Fast, middleware-driven, lightweight server.
- **TypeScript:** Static typing for robust, maintainable code.
- **Sequelize (MySQL):** ORM for schema management.
- **dotenv-flow:** Environment-based configuration.
- **IntelliJ HTTP Client:** API tests defined in tests/*.http, generating HTML in /reports.

## ⚙️ Installation

1. Clone repository
```
git clone https://github.com/DanielADK/scheldon.git
cd scheldon
```
2. Configure environment

Copy `.env.example` → `.env` and set:
```
DB_NAME=scheldon
DB_USER=<user>
DB_PASS=<pass>
DB_ROOT_PASS=<root_pass>
PORT=3000
```
3. Start
```
npm install
npm run dev    # or npm start
```

## 📡 API & OpenAPI Compliance
Scheldon fully adheres to the OpenAPI 3.0.0 specification, with a complete API information defined in swagger.json (`localhost:<PORT>/swagger.json`). Enables machine-readable API definitions, seamless client generation, and interactive documentation via Swagger UI at `http://localhost:<PORT>/docs`.

### Selected endpoints

| Endpoint                                | Method | Description                                                   |
|-----------------------------------------|--------|---------------------------------------------------------------|
| /students                               | GET    | List students (paginated)                                     |
| /students/{id}                          | GET    | Retrieve details for a student by ID                          |
| /students                               | POST   | Create a new student (body: `StudentDTO`)                     |
| /employees                              | GET    | List all employees (teachers/staff).                          |
| /classes                                | GET    | Fetch classes with associated student groups (paginated)      |
| /classes/{id}                           | GET    | Get detailed class information by ID                          |
| /classes/at-time/{time}                 | GET    | Retrieve classes scheduled at an exact date-time (YYYY-MM-DD) |
| /class-registers/{lessonId}             |GET| Fetch class register entry for a specific lesson.             |
| /class-registers/{lessonId}/attendances |GET| Retrieve attendance list for a lesson.                        |
| /class-registers/{lessonId}/attendances | PUT| Update attendance records (body: array of `AttendanceUpdate`|
| /timetables/stable/sets                 |GET|List all timetable sests|
| /timetables/stable/sets/{id}/entries    |GET|List timetable entries within a set|
| /timetables/temporary/classes/{id}/at/{date}|GET|Get substitution timetable for a class on a given date (YYYY-MM-DD).|
> **Note:** For full detail on paths, schemas, and examples, see the `/docs` endpoint

## 📝 Test Reports
Open the HTML files in `/reports` path in repository to review test suites and sample requests/responses generated via the IntelliJ HTTP Client