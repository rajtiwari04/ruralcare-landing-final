.PHONY: dev seed install clean

# Start all services in parallel
dev:
	@echo "Starting RuralCare AI..."
	@cd backend       && npm run dev &
	@cd frontend      && npm run dev &
	@cd telegram-bot  && npm run dev &
	@echo "Backend:   http://localhost:5000"
	@echo "Frontend:  http://localhost:5173"
	@echo "Press Ctrl+C to stop all"
	@wait

# Install all dependencies
install:
	cd backend       && npm install
	cd frontend      && npm install
	cd telegram-bot  && npm install
	cd whatsapp-bot  && npm install

# Seed database
seed:
	cd backend && node scripts/seed-users.js
	cd backend && node scripts/seed-schemes.js

# Clean node_modules
clean:
	rm -rf backend/node_modules
	rm -rf frontend/node_modules
	rm -rf telegram-bot/node_modules
	rm -rf whatsapp-bot/node_modules

# Build frontend for production
build:
	cd frontend && npm run build

# Check all services health
health:
	@curl -s http://localhost:5000/api/health | python3 -m json.tool
