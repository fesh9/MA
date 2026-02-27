# Сборка образов
docker build -t my-gateway:latest ./gateway
docker build -t my-service-5:latest ./service_5
docker build -t my-service-6:latest ./service_6

# Подготовка виртуальных серверов, два контейнера, внутри которых будет работать свой собственный Docker-демон.
# Запускаем менеджер
docker run -d --privileged --name node-manager -p 8080:80 --hostname node-manager docker:dind
# Запускаем воркер
docker run -d --privileged --name node-worker --hostname node-worker docker:dind

# Делаем первый узел главным
docker exec -it node-manager docker swarm init
# Вставляем полученную команду (docker swarm join --token ...):
docker exec -it node-worker

# Нужно доставить образы на оба узла, чтобы Swarm мог их запускать везде.
# Копируем конфиги в менеджер
docker cp . node-manager:/app
# Сохраняем образы в архив и перекидываем на воркер
docker save my-gateway my-service-5 my-service-6 -o images.tar
docker cp images.tar node-worker:/images.tar
docker exec -it node-worker docker load -i /images.tar
# Загружаем те же образы в менеджер (через экспорт из докера хоста в контейнер)
docker cp images.tar node-manager:/images.tar
docker exec -it node-manager docker load -i /images.tar
# Также копируем папку с проектом (для docker-stack.yaml)
docker cp . node-manager:/app

# Деплой
docker exec -it node-manager docker stack deploy -c /app/docker-stack.yaml my_cluster

# Проверка
# Два компьютера
docker exec -it node-manager docker node ls
# все реплики (3/3 и 3/3) запущены
docker exec -it node-manager docker service ls
# задачи распределены между узлами
docker exec -it node-manager docker service ps my_cluster_service_5

# Запрос
Invoke-RestMethod -Uri "http://localhost:8080/api/service-5/"

# Запрос через curl
curl http://localhost:8080/api/service-5/






# 7. Остановка и очистка
# А. Удаление приложения (Stack)
# Сначала удаляем сами микросервисы. Swarm корректно завершит процессы Node.js и удалит внутренние сети.
docker exec -it node-manager docker stack rm my_cluster
# Б. Остановка «железа»
# Теперь удаляем контейнеры, которые имитировали наши серверы.
docker rm -f node-manager node-worker
# В. Очистка временных файлов и образов на хосте
# Удаляем архив переноса и образы, чтобы они не занимали место на твоем реальном диске D:.
# Удаление архива
Remove-Item images.tar
# Удаление локальных образов (опционально)
docker rmi my-gateway:latest my-service-5:latest my-service-6:latest
