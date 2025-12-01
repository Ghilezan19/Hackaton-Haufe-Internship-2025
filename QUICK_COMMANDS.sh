#!/bin/bash
# 🚀 Lintora - Quick Commands pentru Management Site

# Culori pentru output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Lintora Management Commands - scoala-ai.ro${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""

# Function pentru status general
status() {
    echo -e "${YELLOW}📊 Status Servicii:${NC}"
    echo ""
    echo -e "${BLUE}Backend Status:${NC}"
    systemctl status lintora-backend.service --no-pager | head -20
    echo ""
    echo -e "${BLUE}Nginx Status:${NC}"
    systemctl status nginx --no-pager | head -10
    echo ""
    echo -e "${BLUE}Health Check:${NC}"
    curl -s https://scoala-ai.ro/api/health | jq . || echo "API nu răspunde"
}

# Function pentru restart complet
restart_all() {
    echo -e "${YELLOW}🔄 Restart toate serviciile...${NC}"
    systemctl restart lintora-backend.service
    systemctl reload nginx
    echo -e "${GREEN}✅ Servicii restarted!${NC}"
    sleep 2
    status
}

# Function pentru logs backend
logs_backend() {
    echo -e "${YELLOW}📋 Backend Logs (Ctrl+C pentru a opri):${NC}"
    journalctl -u lintora-backend.service -f
}

# Function pentru update frontend
update_frontend() {
    echo -e "${YELLOW}📦 Update Frontend...${NC}"
    cd /root/ScoalaDeAi/scoalaaivilcea/Hackaton-Haufe-Internship-2025/frontend
    
    echo "Building..."
    npm run build
    
    echo "Deploying..."
    rm -rf /var/www/scoala-ai/*
    cp -r dist/* /var/www/scoala-ai/
    
    echo -e "${GREEN}✅ Frontend updated!${NC}"
    echo "Verificare: https://scoala-ai.ro"
}

# Function pentru update backend
update_backend() {
    echo -e "${YELLOW}🔧 Restart Backend...${NC}"
    systemctl restart lintora-backend.service
    echo -e "${GREEN}✅ Backend restarted!${NC}"
    sleep 2
    systemctl status lintora-backend.service --no-pager | head -15
}

# Menu principal
if [ "$1" == "" ]; then
    echo "Comenzi disponibile:"
    echo ""
    echo -e "  ${GREEN}status${NC}          - Verifică status toate serviciile"
    echo -e "  ${GREEN}restart${NC}         - Restart backend + nginx"
    echo -e "  ${GREEN}logs${NC}            - Vezi logs backend în timp real"
    echo -e "  ${GREEN}update-frontend${NC} - Build și deploy frontend nou"
    echo -e "  ${GREEN}update-backend${NC}  - Restart backend"
    echo -e "  ${GREEN}health${NC}          - Quick health check"
    echo ""
    echo "Utilizare: ./QUICK_COMMANDS.sh <comanda>"
    echo ""
else
    case $1 in
        status)
            status
            ;;
        restart)
            restart_all
            ;;
        logs)
            logs_backend
            ;;
        update-frontend)
            update_frontend
            ;;
        update-backend)
            update_backend
            ;;
        health)
            echo -e "${YELLOW}🏥 Health Check:${NC}"
            echo ""
            echo "Backend local:"
            curl -s http://localhost:3000/api/health | jq .
            echo ""
            echo "API public:"
            curl -s https://scoala-ai.ro/api/health | jq .
            echo ""
            echo "Frontend:"
            curl -I -s https://scoala-ai.ro | grep -E "HTTP|content-type"
            ;;
        *)
            echo -e "${RED}Comandă necunoscută: $1${NC}"
            echo "Rulează fără argumente pentru a vedea comenzile disponibile."
            ;;
    esac
fi
