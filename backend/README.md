🏗️ Medusa B2B Docker StarterThis repository contains a fully containerized Medusa B2B ecosystem, including the backend API, the Next.js storefront, PostgreSQL, and Redis. It is designed to be a "Gold Master" template for spinning up new B2B projects instantly.🚀 Quick StartClone the repository:Bashgit clone <your-repo-url>
cd <project-folder>
Setup Environment Variables:Copy the .env.template (if you created one) or create a .env in the root:Bash# Database (Internal Docker Link)
DATABASE_URL=postgresql://postgres:password@postgres:5432/medusa-docker
REDIS_URL=redis://redis:6379

# Medusa Settings
JWT_SECRET=something_secret
COOKIE_SECRET=something_secret
Launch the Stack:Bashdocker compose up --build
🔌 Port MappingsServiceInternal PortExternal (Mac/Host) PortURLMedusa API90009001http://localhost:9001Admin Panel9000/app9001/apphttp://localhost:9001/appStorefront80008000http://localhost:8000PostgreSQL54325433localhost:5433