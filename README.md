Aquí tienes tu **README.md** mejorado, más profesional, más claro y con una mejor organización, además de un **Table of Contents** automático.
Listo para **copiar y pegar**:

---

```markdown
# Ryori - Aplicación de Recetas Full-Stack

![Ryori](https://img.shields.io/badge/Ryori-料理-ff6b6b?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Full-Stack](https://img.shields.io/badge/Full--Stack-Modern-37B9F1?style=for-the-badge)

**Ryori** (del japonés 料理, _"cocina"_) es una aplicación web full-stack diseñada para gestionar recetas de manera moderna, ágil y escalable.  
El proyecto sigue una arquitectura basada en microservicios, separando frontend, backend y bases de datos, todo orquestado con Docker Compose.

---

# 📑 Tabla de Contenidos

- [🚀 Stack Tecnológico](#-stack-tecnológico)
- [🏛️ Arquitectura y Flujo de Datos](#️-arquitectura-y-flujo-de-datos)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [⚡ Inicio Rápido](#-inicio-rápido)
- [🧹 Reinicio Completo](#-reinicio-completo)
- [📡 Endpoints de la API](#-endpoints-de-la-api)
- [🛠️ Desarrollo](#️-desarrollo)

---

## 🚀 Stack Tecnológico

### Arquitectura de 4 Servicios

| Servicio                | Tecnología                                | Propósito                                                    |
| ----------------------- | ----------------------------------------- | ------------------------------------------------------------ |
| **Frontend**            | Next.js + TypeScript, Tailwind CSS, Axios | Interfaz moderna, reactiva y optimizada                      |
| **Backend**             | Go (Golang), Gorilla/Mux, GORM            | API REST robusta con lógica de negocio                       |
| **Base de Datos SQL**   | PostgreSQL                                | Gestión relacional: recetas, categorías, ingredientes, pasos |
| **Base de Datos NoSQL** | MongoDB                                   | Metadatos e información de imágenes                          |

---

## 🏛️ Arquitectura y Flujo de Datos

El proyecto ejecuta **4 contenedores Docker** conectados entre sí:
```

┌─────────────────┐ HTTP ┌─────────────────┐ SQL ┌──────────────┐
│ Frontend │───────────▶│ Backend │──────────▶│ PostgreSQL │
│ (Next.js) │◀───────────│ (Go) │◀──────────│ (db:5432) │
│ (puerto 3000) │ │ (puerto 8080) │ NoSQL └──────────────┘
└─────────────────┘ └─────────────────┘ │
│ ┌─────────────┐
└─────▶│ MongoDB │
│ (mongo:27017)│
└─────────────┘

````

### Comunicación entre servicios

- **Frontend → Backend**: `http://localhost:8080`
- **Backend → PostgreSQL**: `host=db`
- **Backend → MongoDB**: `host=mongo`

---

## 📁 Estructura del Proyecto

```bash
ryori/
├── 🎨 app/                    # Frontend con Next.js
│   ├── src/
│   ├── Dockerfile
│   └── next.config.ts
│
├── ⚙️ backend/                # Backend en Go
│   ├── handlers/             # Controladores HTTP
│   ├── models/               # Modelos GORM / MongoDB
│   ├── uploads/              # Imágenes almacenadas
│   ├── Dockerfile
│   ├── main.go
│   └── .env
│
├── 🐳 docker-compose.yml     # Orquestación Docker
└── 📚 README.md              # Documentación
````

---

## ⚡ Inicio Rápido

### Prerrequisitos

- Docker Desktop instalado y corriendo ✔️

### Instalación

1. **Limpiar caché (opcional, recomendado)**

   ```bash
   docker system prune -a -f
   ```

2. **Construir y ejecutar los servicios**

   ```bash
   docker-compose up --build
   ```

3. **Abrir la aplicación**
   👉 [http://localhost:3000](http://localhost:3000)

---

## 🧹 Reinicio Completo

Para resetear **contenedores + volúmenes + imágenes locales**:

```bash
docker-compose down -v
rm -f ./backend/uploads/*
```

---

## 📡 Endpoints de la API

Base URL: **[http://localhost:8080](http://localhost:8080)**

### 🍳 Recetas

| Método | Endpoint                          | Descripción              |
| ------ | --------------------------------- | ------------------------ |
| GET    | `/api/v1/recipes`                 | Listar todas las recetas |
| GET    | `/api/v1/recipes?category={name}` | Filtrar por categoría    |
| GET    | `/api/v1/recipes/{id}`            | Obtener receta por ID    |
| POST   | `/api/v1/recipes`                 | Crear una receta         |
| POST   | `/api/v1/recipes/{id}/upload`     | Subir imagen asociada    |

### 📂 Categorías

| Método | Endpoint             | Descripción           |
| ------ | -------------------- | --------------------- |
| GET    | `/api/v1/categories` | Listar categorías     |
| POST   | `/api/v1/categories` | Crear nueva categoría |

### 📁 Archivos

| Método | Endpoint              | Descripción               |
| ------ | --------------------- | ------------------------- |
| GET    | `/uploads/{filename}` | Obtener imagen almacenada |

---

## 🛠️ Desarrollo

### Variables de Entorno (backend)

```env
DB_HOST=db
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=ryori
MONGO_URI=mongodb://mongo:27017
```

### Puertos Expuestos

| Servicio   | Puerto | Acceso                                         |
| ---------- | ------ | ---------------------------------------------- |
| Frontend   | 3000   | [http://localhost:3000](http://localhost:3000) |
| Backend    | 8080   | [http://localhost:8080](http://localhost:8080) |
| PostgreSQL | 5432   | Interno                                        |
| MongoDB    | 27017  | Interno                                        |

---

### 💬 ¿Problemas?

Asegúrate de que:

- Docker Desktop esté activo
- Los puertos **3000** y **8080** estén libres
- No existan contenedores previos corriendo la misma app

---

¡Disfruta construyendo **Ryori**! 🍜🔥

```

---

Si quieres, puedo ayudarte a:

✅ agregar una sección de *Contribuciones*
✅ agregar screenshots
✅ agregar gifs de la app
✅ mejorar la parte de instalación individual (sin Docker)

Solo dímelo.
```
