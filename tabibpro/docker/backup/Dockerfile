FROM alpine:3.20

RUN apk add --no-cache \
    postgresql16-client \
    openssl \
    bash \
    curl \
    dcron \
    pigz

WORKDIR /app

COPY backup.sh /app/backup.sh
RUN chmod +x /app/backup.sh

# Créer le répertoire de backup
RUN mkdir -p /backups

# Configurer le cron
RUN echo "0 2 * * * /app/backup.sh >> /var/log/backup.log 2>&1" | crontab -

CMD ["crond", "-f", "-l", "2"]
