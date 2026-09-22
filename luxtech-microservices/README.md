# LuxTech Microservices — Guide de démarrage IntelliJ

## Prérequis
- Java 17
- Maven 3.9+
- Docker Desktop
- IntelliJ IDEA (Ultimate recommandé)
- MySQL 8.0 (via Docker ou installation locale)

## 1. Ouvrir dans IntelliJ
File → Open → sélectionner ce dossier `luxtech-microservices/`
IntelliJ détecte automatiquement le pom.xml parent Maven multi-modules.

## 2. Démarrer l'infrastructure (Docker)
```bash
# Un seul MySQL pour tous les services + RabbitMQ
docker-compose up -d mysql rabbitmq
```
Les 7 bases de données sont créées automatiquement via `init-databases.sql`.

## 3. Connexion MySQL locale (développement sans Docker)
```
Host     : localhost
Port     : 3306
User     : root
Password : password
```
Créer manuellement les bases si besoin :
```sql
SOURCE init-databases.sql;
```

## 4. Ordre de démarrage des services
1. `eureka-server`        → http://localhost:8761
2. `api-gateway`          → http://localhost:8080
3. `auth-service`         → http://localhost:8081
4. `hotel-service`        → http://localhost:8082
5. `booking-service`      → http://localhost:8083
6. `payment-service`      → http://localhost:8084
7. `agency-service`       → http://localhost:8085
8. `notification-service` → http://localhost:8086
9. `public-api-service`   → http://localhost:8087

## 5. Variables d'environnement
```
JWT_SECRET=bXlTdXBlclNlY3JldEtleUZvckx1eHRlY2hNaWNyb3NlcnZpY2VzMjAyNA==
STRIPE_SECRET_KEY=sk_test_...
MAIL_USERNAME=noreply@luxtech.ma
MAIL_PASSWORD=...
FRONTEND_URL=http://localhost:5173
```

## 6. Endpoints principaux (via Gateway :8080)
| Méthode | Endpoint | Service |
|---------|----------|---------|
| POST | /api/auth/register | auth-service |
| POST | /api/auth/login | auth-service |
| GET  | /api/auth/me | auth-service |
| GET  | /api/hotel/hotels | hotel-service |
| POST | /api/booking/reservations/create | booking-service |
| GET  | /api/search/hotels | public-api-service |
| POST | /api/payment/create-intent | payment-service |

## 7. Architecture
```
React (5173) → API Gateway (8080) → Services (8081-8087)
                     ↕
              Eureka Server (8761)

MySQL (3306) ← tous les services
RabbitMQ (5672) ← booking, payment, agency, notification
```
