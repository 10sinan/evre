# EVRE

EVRE, ekiplerin projelerini ve görevlerini gerçek zamanlı olarak yönetebilmesi için geliştirilmiş modern bir görev takip platformudur.

## Özellikler

- Kanban tabanlı görev yönetimi
- Sürükle-bırak ile görev taşıma
- Gerçek zamanlı güncellemeler (WebSocket)
- Proje ve ekip yönetimi
- Aktivite kayıtları
- Görev filtreleme ve arama
- Analitik ekranları
- Kullanıcı kimlik doğrulama
- Docker ile hızlı kurulum

## Teknolojiler

### Frontend
- React
- Vite
- Zustand
- DnD Kit
- Framer Motion
- Tailwind CSS

### Backend
- Java
- Spring Boot
- PostgreSQL
- WebSocket

### DevOps
- Docker
- Docker Compose

## Kurulum

### Docker ile

```bash
docker compose up --build
```

Servisler:

- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- PostgreSQL: localhost:5432

## Proje Yapısı

```text
.
├── backend/
├── frontend/
├── docker-compose.yml
└── README.md
```

## Geliştirme

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
./mvnw spring-boot:run
```

## Lisans

Bu proje eğitim ve geliştirme amaçlı oluşturulmuştur.
