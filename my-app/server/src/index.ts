// my-adaptive-app/server/src/index.ts
import express from 'express';
import { json } from 'body-parser';
import cors from 'cors'; // Импортируем cors для разрешения кросс-доменных запросов
import * as api from './api'; // Импортируем все функции из api.ts

const app = express();
const PORT = process.env.PORT || 3001; // Сервер будет работать на порту 3001 по умолчанию

// Middleware для обработки JSON-тела запросов
app.use(json());

// Middleware для разрешения CORS
// В разработке можно разрешить все запросы, но для продакшена лучше указать конкретные домены
app.use(cors({
  origin: ['http://localhost:3000'], // Разрешаем запросы с React-приложения, которое обычно работает на 3000 порту
  credentials: true, // Разрешаем отправку куки и заголовков авторизации
}));

// Простой тестовый эндпоинт
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is healthy' });
});

// Пример эндпоинта для получения текущего пользователя
app.get('/api/currentUser', async (req, res) => {
  try {
    // В реальном приложении здесь будет логика извлечения userId из сессии или JWT то��ена
    // Для простоты пока что getAuth() будет использовать заглушку из actions.ts
    const user = await api.getCurrentUser();
    res.json(user);
  } catch (error: any) {
    console.error('Error fetching current user:', error);
    res.status(401).json({ error: error.message || 'Authentication error' });
  }
});

// Пример эндпоинта для установки пользователя администратором
app.post('/api/setUserAsAdmin', async (req, res) => {
  try {
    // В реальном приложении здесь должна быть серьезная проверка авторизации
    // Например, только уже существующий администратор может это сделать
    const result = await api.setUserAsAdmin();
    res.json(result);
  } catch (error: any) {
    console.error('Error setting user as admin:', error);
    res.status(403).json({ error: error.message || 'Forbidden' });
  }
});

// Пример эндпоинта для очистки схем и приложений (административная функция)
app.post('/api/clearAllProcessSchemasAndApplications', async (req, res) => {
  try {
    const result = await api.clearAllProcessSchemasAndApplications();
    res.json(result);
  } catch (error: any) {
    console.error('Error clearing schemas and applications:', error);
    res.status(403).json({ error: error.message || 'Forbidden' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});