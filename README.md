# Pikmi Blog

Полнофункциональный блог‑сервис с аутентификацией, постами, комментариями и избранным.
Проект состоит из **backend (Node.js + TypeScript + Prisma)** и **frontend (React + Vite + Tailwind)** и запускается через Docker.

---

## 📁 Структура проекта

```
Pikmi-blog/
├── docker-compose.yml
├── pyproject.toml
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── .env.example
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── src/
│       ├── index.ts
│       ├── db.ts
│       ├── middleware/
│       │   ├── auth.ts
│       │   ├── errorHandler.ts
│       │   └── validation.ts
│       └── routes/
│           ├── auth.ts
│           ├── posts.ts
│           ├── comments.ts
│           ├── favorites.ts
│           └── users.ts
│
├── frontend/
│   ├── Dockerfile
│   ├── index.html
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── api/
│       │   └── axios.ts
│       ├── components/
│       │   └── layout/
│       │       ├── Navbar.tsx
│       │       └── ThemeSwitcher.tsx
│       ├── context/
│       │   ├── AuthContext.tsx
│       │   └── ThemeContext.tsx
│       └── pages/
│           ├── Home.tsx
│           ├── Login.tsx
│           ├── Register.tsx
│           ├── Profile.tsx
│           ├── PostDetail.tsx
│           ├── CreatePost.tsx
│           ├── EditPost.tsx
│           └── Favorites.tsx
│
└── database/
    ├── schema.sql
    └── erd-diagram.md
```

---

## 🚀 Запуск проекта

### 1. Клонирование

```bash
git clone <repo-url>
cd Pikmi-blog
```

### 2. Переменные окружения

Создайте файлы:

* `backend/.env` на основе `.env.example`
* `frontend/.env` на основе `.env.example`

### 3. Запуск через Docker

```bash
docker-compose up --build
```

После запуска:

* **Frontend**: [http://localhost:5173](http://localhost:5173)
* **Backend API**: [http://localhost:3000](http://localhost:3000)

---

## ✨ Функциональность

### Пользователи

* Регистрация и вход
* JWT‑аутентификация
* Профиль пользователя

### Посты

* Создание, редактирование и удаление постов
* Просмотр списка постов
* Просмотр отдельного поста

### Комментарии и избранное

* Комментирование постов
* Добавление постов в избранное

### UI

* Переключение светлой / тёмной темы
* Адаптивный интерфейс

---

## 🛠 Технологии

### Backend

* Node.js
* TypeScript
* Express
* Prisma ORM
* PostgreSQL
* JWT

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Axios

### DevOps

* Docker
* Docker Compose

---

## 📌 База данных

* SQL‑схема: `database/schema.sql`
* ER‑диаграмма: `database/erd-diagram.md`
* Миграции Prisma: `backend/prisma/migrations`

---

## 👤 Автор

**Kotagiri0**

Проект выполнен в рамках курса *HSE Lyceum Web 2025*
