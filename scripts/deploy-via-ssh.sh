#!/bin/bash

# Скрипт для автоматического деплоя через SSH с паролем
# Использование: ./scripts/deploy-via-ssh.sh

SERVER="147.45.98.110"
USER="root"
PASSWORD="v6kvGJiGPaw^9-"

# Проверяем наличие expect
if ! command -v expect &> /dev/null; then
    echo "❌ expect не установлен. Устанавливаю..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install expect || { echo "❌ Не удалось установить expect. Установите вручную: brew install expect"; exit 1; }
    else
        echo "❌ Установите expect вручную: sudo apt-get install expect (Ubuntu/Debian) или sudo yum install expect (CentOS/RHEL)"
        exit 1
    fi
fi

echo "🚀 Начинаю деплой на сервер $SERVER..."

expect << EOF
set timeout 300
spawn ssh -o StrictHostKeyChecking=no $USER@$SERVER

expect {
    "password:" {
        send "$PASSWORD\r"
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
}

expect "# "
send "cd /root/idylle-spb\r"
expect "# "

send "git pull origin main\r"
expect "# "

send "chmod +x scripts/full-deploy.sh\r"
expect "# "

send "./scripts/full-deploy.sh\r"
expect {
    "# " {
        # Команда завершилась
    }
    timeout {
        puts "⚠️  Таймаут при выполнении скрипта"
        exit 1
    }
}

send "exit\r"
expect eof
EOF

echo ""
echo "✅ Деплой завершен!"
