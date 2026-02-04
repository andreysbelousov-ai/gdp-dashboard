# Dockerfile для запуска Opus 4.5 Agent
FROM node:18-alpine

# Установка рабочей директории
WORKDIR /app

# Копирование файлов агента
COPY agents/ ./agents/
COPY .github/agents/ ./.github/agents/

# Установка метаданных
LABEL maintainer="Your Name <your.email@example.com>"
LABEL description="Opus 4.5 Agent Runner"
LABEL version="1.0.0"

# Переменные окружения по умолчанию
# Примечание: В production используйте docker run -e или --env-file
ENV OPUS_API_ENDPOINT="https://api.anthropic.com/v1/messages"

# Создание non-root пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Изменение владельца файлов
RUN chown -R nodejs:nodejs /app

# Переключение на non-root пользователя
USER nodejs

# Healthcheck (опционально)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('healthy')" || exit 1

# Точка входа
ENTRYPOINT ["node", "agents/run_opus_agent.js"]

# По умолчанию не передаем аргументы
CMD []
