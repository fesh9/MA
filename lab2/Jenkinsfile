pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Service A') {
            steps {
                script {
                    dir('lab2/service-a') {
                        bat "docker build -t service-a-image:latest ."
                    }
                }
            }
        }

        stage('Build Service B') {
            steps {
                script {
                    dir('lab2/service-b') {
                        bat "docker build -t service-b-image:latest ."
                    }
                }
            }
        }

        stage('Test Deployment') {
            steps {
                script {
                    dir('lab2') {
                        bat "docker-compose build"
                        echo "Сборка через Compose прошла успешно!"
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Пайплайн завершен успешно!'
        }
    }
}