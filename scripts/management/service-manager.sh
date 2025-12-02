#!/bin/bash

# GACP Service Manager - ระบบจัดการ Services แบบยั่งยืน
# Version: 1.0.0
# Author: GACP Platform Team

set -euo pipefail

# สีสำหรับ output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="/workspaces/gacp-certify-flow-main"
LOG_DIR="$PROJECT_ROOT/logs"
PID_DIR="$PROJECT_ROOT/pids"
BACKUP_DIR="$PROJECT_ROOT/backups"

# Services Configuration
declare -A SERVICES=(
    ["auth"]="microservices/auth-service:3001"
    ["survey"]="microservices/api-survey:3002"
    ["certification"]="microservices/certification-service:3003"
    ["trace"]="microservices/api-trace:3004"
    ["benchmark"]="microservices/api-benchmark:3005"
    ["frontend"]="frontend:3000"
    ["mongodb"]="docker:27017"
    ["redis"]="docker:6379"
)

# Utility Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Setup Functions
setup_directories() {
    log_info "สร้างโครงสร้างไดเรกทอรี่..."
    
    mkdir -p "$LOG_DIR"
    mkdir -p "$PID_DIR" 
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$PROJECT_ROOT/tmp"
    
    # สร้าง log directories สำหรับแต่ละ service
    for service in "${!SERVICES[@]}"; do
        mkdir -p "$LOG_DIR/$service"
    done
    
    log_success "โครงสร้างไดเรกทอรี่ถูกสร้างเรียบร้อย"
}

setup_environment() {
    log_info "ตั้งค่า Environment Variables..."
    
    # สร้าง .env หลักถ้ายังไม่มี
    if [[ ! -f "$PROJECT_ROOT/.env" ]]; then
        cat > "$PROJECT_ROOT/.env" << 'EOF'
# GACP Platform Environment Configuration
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://admin:secure_password_123@localhost:27017/gacp_platform?authSource=admin
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_key_here_change_in_production
JWT_EXPIRE=24h

# Services URLs
AUTH_SERVICE_URL=http://localhost:3001
SURVEY_SERVICE_URL=http://localhost:3002
CERTIFICATION_SERVICE_URL=http://localhost:3003
TRACE_SERVICE_URL=http://localhost:3004
BENCHMARK_SERVICE_URL=http://localhost:3005

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
LOG_FILE=combined.log

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=

# Development
DEBUG=gacp:*
WATCH_FILES=true
HOT_RELOAD=true
EOF
        log_success "สร้างไฟล์ .env หลักเรียบร้อย"
    fi
    
    # Copy .env ไปยัง microservices ที่ต้องการ
    for service_path in microservices/*/; do
        if [[ -d "$PROJECT_ROOT/$service_path" ]]; then
            service_name=$(basename "$service_path")
            if [[ ! -f "$PROJECT_ROOT/$service_path/.env" ]]; then
                cp "$PROJECT_ROOT/.env" "$PROJECT_ROOT/$service_path/.env"
                log_info "สำเนา .env ไปยัง $service_name"
            fi
        fi
    done
}

# Process Management Functions
get_service_pid() {
    local service=$1
    local pid_file="$PID_DIR/${service}.pid"
    
    if [[ -f "$pid_file" ]]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo "$pid"
            return 0
        else
            rm -f "$pid_file"
        fi
    fi
    
    # ค้นหา process ที่รันอยู่
    local service_info="${SERVICES[$service]}"
    local port=$(echo "$service_info" | cut -d':' -f2)
    
    if [[ "$service_info" == *"docker"* ]]; then
        # Docker service
        docker ps --filter "publish=$port" --format "{{.ID}}" | head -1
    else
        # Node.js service
        lsof -ti:$port 2>/dev/null | head -1
    fi
}

is_service_running() {
    local service=$1
    local pid=$(get_service_pid "$service")
    [[ -n "$pid" ]]
}

start_service() {
    local service=$1
    local service_info="${SERVICES[$service]}"
    local service_path=$(echo "$service_info" | cut -d':' -f1)
    local port=$(echo "$service_info" | cut -d':' -f2)
    
    if is_service_running "$service"; then
        log_warning "Service $service กำลังทำงานอยู่แล้ว"
        return 0
    fi
    
    log_info "เริ่มต้น service: $service"
    
    if [[ "$service_info" == *"docker"* ]]; then
        start_docker_service "$service" "$port"
    else
        start_node_service "$service" "$service_path" "$port"
    fi
}

start_node_service() {
    local service=$1
    local service_path=$2
    local port=$3
    local full_path="$PROJECT_ROOT/$service_path"
    
    if [[ ! -d "$full_path" ]]; then
        log_error "Service directory ไม่พบ: $full_path"
        return 1
    fi
    
    cd "$full_path"
    
    # ติดตั้ง dependencies ถ้าจำเป็น
    if [[ ! -d "node_modules" ]] || [[ "package.json" -nt "node_modules" ]]; then
        log_info "ติดตั้ง dependencies สำหรับ $service..."
        npm install --silent
    fi
    
    # สร้าง logs directory
    mkdir -p "$LOG_DIR/$service"
    
    # เริ่มต้น service
    local start_script="start"
    if [[ -f "package.json" ]] && npm run | grep -q "dev"; then
        start_script="dev"
    fi
    
    log_info "รัน npm $start_script สำหรับ $service บน port $port"
    
    nohup npm run $start_script > "$LOG_DIR/$service/output.log" 2>&1 &
    local pid=$!
    echo "$pid" > "$PID_DIR/${service}.pid"
    
    # รอให้ service พร้อมใช้งาน
    wait_for_service "$service" "$port" 30
    
    if is_service_running "$service"; then
        log_success "Service $service เริ่มต้นสำเร็จ (PID: $pid)"
    else
        log_error "ไม่สามารถเริ่มต้น service $service ได้"
        return 1
    fi
}

start_docker_service() {
    local service=$1
    local port=$2
    
    case $service in
        "mongodb")
            start_mongodb
            ;;
        "redis")
            start_redis
            ;;
        *)
            log_error "Docker service ไม่รู้จัก: $service"
            return 1
            ;;
    esac
}

start_mongodb() {
    log_info "เริ่มต้น MongoDB..."
    
    if docker ps | grep -q "gacp-mongodb"; then
        log_warning "MongoDB กำลังทำงานอยู่แล้ว"
        return 0
    fi
    
    # หยุด container เก่าถ้ามี
    docker stop gacp-mongodb 2>/dev/null || true
    docker rm gacp-mongodb 2>/dev/null || true
    
    # เริ่มต้น MongoDB
    docker run -d \
        --name gacp-mongodb \
        -p 27017:27017 \
        -e MONGO_INITDB_ROOT_USERNAME=admin \
        -e MONGO_INITDB_ROOT_PASSWORD=secure_password_123 \
        -e MONGO_INITDB_DATABASE=gacp_platform \
        -v gacp_mongodb_data:/data/db \
        mongo:7.0 \
        > "$LOG_DIR/mongodb/container.log" 2>&1
    
    wait_for_service "mongodb" "27017" 60
    log_success "MongoDB เริ่มต้นสำเร็จ"
}

start_redis() {
    log_info "เริ่มต้น Redis..."
    
    if docker ps | grep -q "gacp-redis"; then
        log_warning "Redis กำลังทำงานอยู่แล้ว"
        return 0
    fi
    
    # หยุด container เก่าถ้ามี
    docker stop gacp-redis 2>/dev/null || true
    docker rm gacp-redis 2>/dev/null || true
    
    # เริ่มต้น Redis
    docker run -d \
        --name gacp-redis \
        -p 6379:6379 \
        -v gacp_redis_data:/data \
        redis:7.2-alpine \
        redis-server --appendonly yes \
        > "$LOG_DIR/redis/container.log" 2>&1
    
    wait_for_service "redis" "6379" 30
    log_success "Redis เริ่มต้นสำเร็จ"
}

wait_for_service() {
    local service=$1
    local port=$2
    local timeout=${3:-30}
    local count=0
    
    log_info "รอให้ $service พร้อมใช้งาน (timeout: ${timeout}s)..."
    
    while [[ $count -lt $timeout ]]; do
        if nc -z localhost "$port" 2>/dev/null; then
            log_success "$service พร้อมใช้งานแล้ว"
            return 0
        fi
        
        sleep 1
        ((count++))
        
        if [[ $((count % 5)) -eq 0 ]]; then
            log_info "รอ $service... (${count}/${timeout}s)"
        fi
    done
    
    log_error "$service ไม่พร้อมใช้งานหลังจาก ${timeout} วินาทีแล้ว"
    return 1
}

stop_service() {
    local service=$1
    local pid=$(get_service_pid "$service")
    
    if [[ -z "$pid" ]]; then
        log_warning "Service $service ไม่ได้ทำงานอยู่"
        return 0
    fi
    
    log_info "หยุด service: $service (PID: $pid)"
    
    local service_info="${SERVICES[$service]}"
    if [[ "$service_info" == *"docker"* ]]; then
        stop_docker_service "$service"
    else
        stop_node_service "$service" "$pid"
    fi
    
    # ลบ PID file
    rm -f "$PID_DIR/${service}.pid"
    
    log_success "Service $service หยุดทำงานแล้ว"
}

stop_node_service() {
    local service=$1
    local pid=$2
    
    # ส่งสัญญาณ TERM ก่อน
    kill -TERM "$pid" 2>/dev/null || true
    
    # รอให้ process หยุด
    local count=0
    while kill -0 "$pid" 2>/dev/null && [[ $count -lt 10 ]]; do
        sleep 1
        ((count++))
    done
    
    # ถ้าไม่หยุด ใช้ KILL
    if kill -0 "$pid" 2>/dev/null; then
        log_warning "Force kill service $service"
        kill -KILL "$pid" 2>/dev/null || true
    fi
}

stop_docker_service() {
    local service=$1
    
    case $service in
        "mongodb")
            docker stop gacp-mongodb 2>/dev/null || true
            ;;
        "redis")
            docker stop gacp-redis 2>/dev/null || true
            ;;
    esac
}

restart_service() {
    local service=$1
    log_info "รีสตาร์ท service: $service"
    
    stop_service "$service"
    sleep 2
    start_service "$service"
}

# Health Check Functions
health_check() {
    local service=${1:-"all"}
    
    if [[ "$service" == "all" ]]; then
        log_header "สุขภาพระบบ GACP Platform"
        
        local total=0
        local healthy=0
        
        for svc in "${!SERVICES[@]}"; do
            ((total++))
            if check_service_health "$svc"; then
                ((healthy++))
            fi
        done
        
        echo
        log_info "สรุป: $healthy/$total services ทำงานปกติ"
        
        if [[ $healthy -eq $total ]]; then
            log_success "ระบบทั้งหมดทำงานปกติ 🎉"
            return 0
        else
            log_warning "มี services บางตัวไม่ทำงาน ⚠️"
            return 1
        fi
    else
        check_service_health "$service"
    fi
}

check_service_health() {
    local service=$1
    local service_info="${SERVICES[$service]}"
    local port=$(echo "$service_info" | cut -d':' -f2)
    
    printf "%-15s" "$service:"
    
    if is_service_running "$service"; then
        if nc -z localhost "$port" 2>/dev/null; then
            echo -e "${GREEN}✓ HEALTHY${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠ RUNNING but PORT UNAVAILABLE${NC}"
            return 1
        fi
    else
        echo -e "${RED}✗ STOPPED${NC}"
        return 1
    fi
}

# Log Management Functions
show_logs() {
    local service=${1:-"all"}
    local lines=${2:-50}
    
    if [[ "$service" == "all" ]]; then
        log_header "Logs ทั้งหมด"
        for svc in "${!SERVICES[@]}"; do
            echo -e "\n${CYAN}=== $svc ===${NC}"
            show_service_logs "$svc" "$lines"
        done
    else
        show_service_logs "$service" "$lines"
    fi
}

show_service_logs() {
    local service=$1
    local lines=$2
    local log_file="$LOG_DIR/$service/output.log"
    
    if [[ -f "$log_file" ]]; then
        tail -n "$lines" "$log_file"
    else
        log_warning "ไม่พบ log file สำหรับ $service"
    fi
}

clear_logs() {
    local service=${1:-"all"}
    
    if [[ "$service" == "all" ]]; then
        log_info "ล้าง logs ทั้งหมด..."
        find "$LOG_DIR" -name "*.log" -type f -delete
        log_success "ล้าง logs ทั้งหมดเรียบร้อย"
    else
        local log_dir="$LOG_DIR/$service"
        if [[ -d "$log_dir" ]]; then
            rm -f "$log_dir"/*.log
            log_success "ล้าง logs ของ $service เรียบร้อย"
        fi
    fi
}

# Backup Functions
backup_system() {
    local backup_name="gacp_backup_$(date +%Y%m%d_%H%M%S)"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    log_info "สำรองข้อมูลระบบ..."
    mkdir -p "$backup_path"
    
    # Backup configurations
    cp -r "$PROJECT_ROOT"/.env* "$backup_path/" 2>/dev/null || true
    cp -r "$PROJECT_ROOT"/package*.json "$backup_path/" 2>/dev/null || true
    
    # Backup microservices configs
    mkdir -p "$backup_path/microservices"
    for service_dir in "$PROJECT_ROOT"/microservices/*/; do
        if [[ -d "$service_dir" ]]; then
            service_name=$(basename "$service_dir")
            mkdir -p "$backup_path/microservices/$service_name"
            cp -r "$service_dir"/{package*.json,.env*,src,config} "$backup_path/microservices/$service_name/" 2>/dev/null || true
        fi
    done
    
    # Backup database
    if is_service_running "mongodb"; then
        log_info "สำรองข้อมูล MongoDB..."
        docker exec gacp-mongodb mongodump --host localhost --port 27017 \
            --username admin --password secure_password_123 --authenticationDatabase admin \
            --out /tmp/backup 2>/dev/null || true
        docker cp gacp-mongodb:/tmp/backup "$backup_path/mongodb" 2>/dev/null || true
    fi
    
    # สร้าง tar archive
    cd "$BACKUP_DIR"
    tar -czf "${backup_name}.tar.gz" "$backup_name"
    rm -rf "$backup_name"
    
    log_success "สำรองข้อมูลเรียบร้อย: ${backup_name}.tar.gz"
}

# Main Functions
show_status() {
    log_header "สถานะ GACP Platform Services"
    
    printf "%-15s %-10s %-6s %-20s\n" "SERVICE" "STATUS" "PORT" "PATH"
    echo "================================================================"
    
    for service in "${!SERVICES[@]}"; do
        local service_info="${SERVICES[$service]}"
        local service_path=$(echo "$service_info" | cut -d':' -f1)
        local port=$(echo "$service_info" | cut -d':' -f2)
        
        printf "%-15s" "$service"
        
        if is_service_running "$service"; then
            printf "${GREEN}%-10s${NC}" "RUNNING"
        else
            printf "${RED}%-10s${NC}" "STOPPED"
        fi
        
        printf "%-6s %-20s\n" "$port" "$service_path"
    done
    
    echo
    health_check "all" >/dev/null 2>&1
}

start_all() {
    log_header "เริ่มต้นทุก Services"
    
    # เริ่ม infrastructure services ก่อน
    log_info "เริ่มต้น Infrastructure Services..."
    start_service "mongodb"
    start_service "redis"
    
    sleep 3
    
    # เริ่ม application services
    log_info "เริ่มต้น Application Services..."
    for service in "auth" "survey" "certification" "trace" "benchmark"; do
        start_service "$service"
    done
    
    # เริ่ม frontend สุดท้าย
    log_info "เริ่มต้น Frontend..."
    start_service "frontend"
    
    echo
    health_check "all"
}

stop_all() {
    log_header "หยุดทุก Services"
    
    # หยุด application services ก่อน
    for service in "frontend" "benchmark" "trace" "certification" "survey" "auth"; do
        stop_service "$service"
    done
    
    # หยุด infrastructure services สุดท้าย
    stop_service "redis"
    stop_service "mongodb"
    
    log_success "หยุดทุก services แล้ว"
}

restart_all() {
    log_header "รีสตาร์ททุก Services"
    stop_all
    sleep 5
    start_all
}

show_help() {
    echo -e "${CYAN}GACP Service Manager${NC}"
    echo -e "${CYAN}====================${NC}"
    echo
    echo "การใช้งาน: $0 <command> [service] [options]"
    echo
    echo "Commands:"
    echo "  setup                   - ตั้งค่าเริ่มต้นระบบ"
    echo "  start [service]         - เริ่มต้น service (หรือทั้งหมด)"
    echo "  stop [service]          - หยุด service (หรือทั้งหมด)" 
    echo "  restart [service]       - รีสตาร์ท service (หรือทั้งหมด)"
    echo "  status                  - แสดงสถานะทุก services"
    echo "  health [service]        - ตรวจสอบสุขภาพ service"
    echo "  logs [service] [lines]  - แสดง logs"
    echo "  clear-logs [service]    - ล้าง logs"
    echo "  backup                  - สำรองข้อมูลระบบ"
    echo
    echo "Services:"
    for service in "${!SERVICES[@]}"; do
        echo "  $service"
    done
    echo
    echo "ตัวอย่าง:"
    echo "  $0 setup                # ตั้งค่าเริ่มต้น"
    echo "  $0 start                # เริ่มต้นทุก services"
    echo "  $0 start auth           # เริ่มต้นเฉพาะ auth service"
    echo "  $0 status               # แสดงสถานะ"
    echo "  $0 logs auth 100        # แสดง 100 บรรทัดล่าสุดของ auth"
    echo "  $0 health               # ตรวจสอบสุขภาพทั้งหมด"
}

# Main Script Logic
main() {
    cd "$PROJECT_ROOT"
    
    local command=${1:-"help"}
    local service=${2:-""}
    local option=${3:-""}
    
    case $command in
        "setup")
            setup_directories
            setup_environment
            log_success "ระบบตั้งค่าเรียบร้อยแล้ว!"
            ;;
        "start")
            if [[ -n "$service" ]]; then
                start_service "$service"
            else
                start_all
            fi
            ;;
        "stop")
            if [[ -n "$service" ]]; then
                stop_service "$service"
            else
                stop_all
            fi
            ;;
        "restart")
            if [[ -n "$service" ]]; then
                restart_service "$service"
            else
                restart_all
            fi
            ;;
        "status")
            show_status
            ;;
        "health")
            health_check "$service"
            ;;
        "logs")
            local lines=${option:-50}
            show_logs "$service" "$lines"
            ;;
        "clear-logs")
            clear_logs "$service"
            ;;
        "backup")
            backup_system
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# เรียกใช้ main function
main "$@"