# GigaChat Web Client

Приложение в стиле ChatGPT на базе публичного API GigaChat.

## Технологии

- React 19 + TypeScript + Vite
- Zustand
- Tailwind CSS
- Fetch API
- react-markdown + rehype-highlight
- IndexedDB (через idb-keyval)

## Функциональность

### Интерфейс чата

- главный экран с областью сообщений и полем ввода
- визуальное разделение сообщений пользователя и ассистента
- markdown-рендеринг ответов
- подсветка кода в блоках
- индикатор генерации ответа
- авто-прокрутка к последнему сообщению
- копирование сообщений в буфер обмена
- остановка генерации ответа

### Управление чатами

- sidebar со списком чатов
- создание нового чата
- авто-генерация названия по первому сообщению
- переключение между чатами без потери истории
- редактирование названия чата
- удаление чата с подтверждением
- поиск по названию и содержимому чатов
- сохранение истории и настроек в IndexedDB

### Интеграция с GigaChat API

- OAuth client credentials
- `POST /api/v1/chat/completions`
- передача контекста диалога (`system/user/assistant`)
- streaming-режим (`stream: true`)
- SSE-парсинг и вывод токенов по мере получения
- fallback на обычный REST-ответ (`stream: false`), если streaming недоступен
- работа с мультимодальными запросами (изображения)
- загрузка списка моделей через `GET /api/v1/models`
- настройка параметров генерации: `temperature`, `top_p`, `max_tokens`, `repetition_penalty`

## Переменные окружения

Создай `.env` в корне проекта:

```bash
VITE_GIGACHAT_CLIENT_ID=your_client_id
VITE_GIGACHAT_USE_DEV_PROXY=true
```

Для секрета можно использовать один из вариантов:

```bash
VITE_GIGACHAT_CLIENT_SECRET=your_client_secret
```

или

```bash
VITE_GIGACHAT_AUTHORIZATION_KEY=base64(client_id:client_secret)
```

Опциональные переменные:

```bash
VITE_GIGACHAT_SCOPE=GIGACHAT_API_PERS
VITE_GIGACHAT_API_BASE=https://gigachat.devices.sberbank.ru/api/v1
VITE_GIGACHAT_OAUTH_URL=https://ngw.devices.sberbank.ru:9443/api/v2/oauth
```

Если опциональные переменные не заданы, приложение использует встроенные значения.
Для локальной разработки рекомендуется `VITE_GIGACHAT_USE_DEV_PROXY=true`.

## Установка и запуск

```bash
npm install
npm run dev
```

После изменения `.env` обязательно перезапусти dev-сервер.

Сборка production:

```bash
npm run build
npm run preview
```

## Проверка ключевых сценариев

1. Отправить сообщение и дождаться потокового ответа.
2. Нажать `Остановить` во время генерации.
3. Создать новый чат, переключиться между чатами.
4. Переименовать чат и удалить через контекстное меню.
5. Использовать поиск по чатам.
6. Перезагрузить страницу и проверить, что история восстановилась.
7. Отправить сообщение с изображением.
8. Изменить `temperature`, `top_p`, `max_tokens`, `repetition_penalty` в настройках и проверить ответ.
9. Проверить fallback: при проблеме со streaming ответ приходит обычным REST.

## Структура проекта

- `src/entities` — бизнес-сущности и Zustand store
- `src/features` — функциональные модули (ввод, сообщения, sidebar, настройки)
- `src/shared` — API-слой, утилиты, UI-компоненты
- `src/widgets` — композиция экранов
