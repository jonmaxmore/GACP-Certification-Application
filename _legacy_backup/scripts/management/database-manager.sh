#!/bin/bash

# GACP Database Manager - ระบบจัดการฐานข้อมูลแบบยั่งยืน
# Version: 1.0.0

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="/workspaces/gacp-certify-flow-main"
BACKUP_DIR="$PROJECT_ROOT/backups/database"
SCRIPTS_DIR="$PROJECT_ROOT/scripts/database"

# Database Configuration
MONGODB_URI="mongodb://admin:secure_password_123@localhost:27017"
DATABASES=("gacp_auth" "gacp_survey" "gacp_certification" "gacp_trace" "gacp_benchmark")

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

# Database Connection Functions
check_mongodb() {
    if ! nc -z localhost 27017 2>/dev/null; then
        log_error "MongoDB ไม่ได้ทำงาน! กรุณาเริ่มต้น MongoDB ก่อน"
        return 1
    fi
    
    if ! docker exec gacp-mongodb mongosh --eval "db.admin.runCommand('ping')" >/dev/null 2>&1; then
        log_error "ไม่สามารถเชื่อมต่อ MongoDB ได้"
        return 1
    fi
    
    log_success "MongoDB เชื่อมต่อสำเร็จ"
    return 0
}

# Database Management Functions
init_databases() {
    log_header "เริ่มต้นฐานข้อมูล"
    
    check_mongodb || return 1
    
    for db in "${DATABASES[@]}"; do
        log_info "สร้างฐานข้อมูล: $db"
        
        docker exec gacp-mongodb mongosh --eval "
            use $db;
            db.createCollection('system_info');
            db.system_info.insertOne({
                database: '$db',
                created: new Date(),
                version: '1.0.0',
                platform: 'GACP'
            });
            print('✓ Database $db สร้างเรียบร้อย');
        " 2>/dev/null || log_warning "Database $db อาจมีอยู่แล้ว"
    done
    
    # สร้าง indexes และ initial data
    setup_auth_database
    setup_survey_database
    setup_certification_database
    setup_trace_database
    setup_benchmark_database
    
    log_success "เริ่มต้นฐานข้อมูลทั้งหมดเรียบร้อย"
}

setup_auth_database() {
    log_info "ตั้งค่าฐานข้อมูล Authentication..."
    
    docker exec gacp-mongodb mongosh gacp_auth --eval "
        // สร้าง Users collection
        db.createCollection('users');
        db.users.createIndex({ email: 1 }, { unique: true });
        db.users.createIndex({ phone: 1 }, { unique: true });
        db.users.createIndex({ organizationType: 1 });
        db.users.createIndex({ createdAt: 1 });
        
        // สร้าง Sessions collection
        db.createCollection('sessions');
        db.sessions.createIndex({ token: 1 }, { unique: true });
        db.sessions.createIndex({ userId: 1 });
        db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
        
        // สร้าง Admin user
        db.users.insertOne({
            email: 'admin@gacp.com',
            password: '\$2a\$12\$LQGnEWI9V9T8VnL5xHo/NO8tY0JCGr0ZrVQ9K3.QXWnZ8K9L3nR3y',
            firstName: 'System',
            lastName: 'Administrator',
            organizationType: 'admin',
            organizationName: 'GACP Platform',
            phoneNumber: '02-123-4567',
            isActive: true,
            isVerified: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        print('✓ Auth database setup complete');
    " 2>/dev/null
}

setup_survey_database() {
    log_info "ตั้งค่าฐานข้อมูล Survey..."
    
    docker exec gacp-mongodb mongosh gacp_survey --eval "
        // สร้าง Surveys collection
        db.createCollection('surveys');
        db.surveys.createIndex({ title: 1 });
        db.surveys.createIndex({ category: 1 });
        db.surveys.createIndex({ isActive: 1 });
        db.surveys.createIndex({ createdAt: 1 });
        
        // สร้าง Survey Responses collection
        db.createCollection('survey_responses');
        db.survey_responses.createIndex({ surveyId: 1 });
        db.survey_responses.createIndex({ userId: 1 });
        db.survey_responses.createIndex({ submittedAt: 1 });
        
        // เพิ่ม sample survey
        db.surveys.insertOne({
            title: 'แบบประเมิน GACP พื้นฐาน',
            description: 'แบบประเมินมาตรฐาน GACP สำหรับเกษตรกร',
            category: 'GACP_BASIC',
            sections: [
                {
                    title: 'ข้อมูลทั่วไป',
                    questions: [
                        {
                            id: 'Q001',
                            question: 'ฟาร์มของท่านมีการปลูกพืชอะไรบ้าง?',
                            type: 'multiple_choice',
                            options: ['ผัก', 'ผลไม้', 'สมุนไพร', 'ธัญพืช']
                        }
                    ]
                }
            ],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        print('✓ Survey database setup complete');
    " 2>/dev/null
}

setup_certification_database() {
    log_info "ตั้งค่าฐานข้อมูล Certification..."
    
    docker exec gacp-mongodb mongosh gacp_certification --eval "
        // สร้าง Applications collection
        db.createCollection('applications');
        db.applications.createIndex({ applicationNumber: 1 }, { unique: true });
        db.applications.createIndex({ applicantId: 1 });
        db.applications.createIndex({ status: 1 });
        db.applications.createIndex({ submittedAt: 1 });
        
        // สร้าง Certificates collection
        db.createCollection('certificates');
        db.certificates.createIndex({ certificateNumber: 1 }, { unique: true });
        db.certificates.createIndex({ applicationId: 1 });
        db.certificates.createIndex({ farmId: 1 });
        db.certificates.createIndex({ expiryDate: 1 });
        
        // สร้าง Inspections collection
        db.createCollection('inspections');
        db.inspections.createIndex({ applicationId: 1 });
        db.inspections.createIndex({ inspectorId: 1 });
        db.inspections.createIndex({ scheduledDate: 1 });
        db.inspections.createIndex({ status: 1 });
        
        print('✓ Certification database setup complete');
    " 2>/dev/null
}

setup_trace_database() {
    log_info "ตั้งค่าฐานข้อมูล Track & Trace..."
    
    docker exec gacp-mongodb mongosh gacp_trace --eval "
        // สร้าง Farms collection
        db.createCollection('farms');
        db.farms.createIndex({ farmCode: 1 }, { unique: true });
        db.farms.createIndex({ 'farmInfo.email': 1 });
        db.farms.createIndex({ 'location.address.province': 1 });
        db.farms.createIndex({ 'certification.gacpNumber': 1 });
        
        // สร้าง Product Batches collection
        db.createCollection('product_batches');
        db.product_batches.createIndex({ batchCode: 1 }, { unique: true });
        db.product_batches.createIndex({ farmCode: 1 });
        db.product_batches.createIndex({ 'product.harvestDate': 1 });
        db.product_batches.createIndex({ status: 1 });
        
        // สร้าง Cultivation Records collection
        db.createCollection('cultivation_records');
        db.cultivation_records.createIndex({ recordCode: 1 }, { unique: true });
        db.cultivation_records.createIndex({ farmCode: 1 });
        db.cultivation_records.createIndex({ 'season.year': 1, 'season.round': 1 });
        
        // สร้าง Tracking History collection
        db.createCollection('tracking_history');
        db.tracking_history.createIndex({ batchCode: 1 });
        db.tracking_history.createIndex({ timestamp: 1 });
        db.tracking_history.createIndex({ location: 1 });
        
        print('✓ Trace database setup complete');
    " 2>/dev/null
}

setup_benchmark_database() {
    log_info "ตั้งค่าฐานข้อมูล Benchmark..."
    
    docker exec gacp-mongodb mongosh gacp_benchmark --eval "
        // สร้าง Benchmarks collection
        db.createCollection('benchmarks');
        db.benchmarks.createIndex({ category: 1 });
        db.benchmarks.createIndex({ region: 1 });
        db.benchmarks.createIndex({ year: 1 });
        db.benchmarks.createIndex({ crop: 1 });
        
        // สร้าง Farm Scores collection
        db.createCollection('farm_scores');
        db.farm_scores.createIndex({ farmId: 1 });
        db.farm_scores.createIndex({ benchmarkId: 1 });
        db.farm_scores.createIndex({ evaluatedAt: 1 });
        
        // เพิ่ม sample benchmarks
        db.benchmarks.insertMany([
            {
                category: 'GACP_BASIC',
                name: 'มาตรฐาน GACP พื้นฐาน',
                description: 'เกณฑ์มาตรฐาน GACP สำหรับผู้ผลิตพืชผัก',
                region: 'ทั่วประเทศ',
                crop: 'ผัก',
                year: 2024,
                criteria: {
                    farmManagement: { weight: 30, minScore: 70 },
                    qualityControl: { weight: 25, minScore: 75 },
                    safety: { weight: 25, minScore: 80 },
                    documentation: { weight: 20, minScore: 65 }
                },
                createdAt: new Date()
            }
        ]);
        
        print('✓ Benchmark database setup complete');
    " 2>/dev/null
}

# Backup Functions
backup_database() {
    local db_name=${1:-"all"}
    local backup_name="backup_$(date +%Y%m%d_%H%M%S)"
    
    mkdir -p "$BACKUP_DIR"
    
    check_mongodb || return 1
    
    log_header "สำรองข้อมูลฐานข้อมูล"
    
    if [[ "$db_name" == "all" ]]; then
        log_info "สำรองข้อมูลทุกฐานข้อมูล..."
        
        docker exec gacp-mongodb mongodump \
            --host localhost:27017 \
            --username admin \
            --password secure_password_123 \
            --authenticationDatabase admin \
            --out "/tmp/$backup_name" 2>/dev/null
            
        docker cp "gacp-mongodb:/tmp/$backup_name" "$BACKUP_DIR/"
        
        # สร้าง compressed archive
        cd "$BACKUP_DIR"
        tar -czf "${backup_name}.tar.gz" "$backup_name"
        rm -rf "$backup_name"
        
        log_success "สำรองข้อมูลทุกฐานข้อมูลเรียบร้อย: ${backup_name}.tar.gz"
    else
        log_info "สำรองข้อมูลฐานข้อมูล: $db_name"
        
        docker exec gacp-mongodb mongodump \
            --host localhost:27017 \
            --username admin \
            --password secure_password_123 \
            --authenticationDatabase admin \
            --db "$db_name" \
            --out "/tmp/$backup_name" 2>/dev/null
            
        docker cp "gacp-mongodb:/tmp/$backup_name" "$BACKUP_DIR/"
        
        cd "$BACKUP_DIR"
        tar -czf "${db_name}_${backup_name}.tar.gz" "$backup_name"
        rm -rf "$backup_name"
        
        log_success "สำรองข้อมูล $db_name เรียบร้อย: ${db_name}_${backup_name}.tar.gz"
    fi
}

restore_database() {
    local backup_file=$1
    
    if [[ ! -f "$backup_file" ]]; then
        log_error "ไม่พบไฟล์สำรอง: $backup_file"
        return 1
    fi
    
    check_mongodb || return 1
    
    log_header "กู้คืนข้อมูลฐานข้อมูล"
    log_warning "การกู้คืนจะเขียนทับข้อมูลเดิม!"
    
    read -p "ต้องการดำเนินการต่อ? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "ยกเลิกการกู้คืน"
        return 0
    fi
    
    # แตกไฟล์สำรอง
    local restore_dir="/tmp/restore_$(date +%s)"
    mkdir -p "$restore_dir"
    
    if [[ "$backup_file" == *.tar.gz ]]; then
        tar -xzf "$backup_file" -C "$restore_dir"
    else
        cp -r "$backup_file" "$restore_dir/"
    fi
    
    # Copy ไฟล์ไปยัง container
    docker cp "$restore_dir" gacp-mongodb:/tmp/
    
    # กู้คืนข้อมูล
    docker exec gacp-mongodb mongorestore \
        --host localhost:27017 \
        --username admin \
        --password secure_password_123 \
        --authenticationDatabase admin \
        --drop \
        "/tmp/$(basename "$restore_dir")" 2>/dev/null
    
    # ลบไฟล์ชั่วคราว
    rm -rf "$restore_dir"
    docker exec gacp-mongodb rm -rf "/tmp/$(basename "$restore_dir")"
    
    log_success "กู้คืนข้อมูลเรียบร้อย"
}

# Maintenance Functions
cleanup_database() {
    local days=${1:-30}
    
    check_mongodb || return 1
    
    log_header "ทำความสะอาดฐานข้อมูล"
    log_info "ลบข้อมูลที่เก่ากว่า $days วัน..."
    
    # ลบ sessions ที่หมดอายุ
    docker exec gacp-mongodb mongosh gacp_auth --eval "
        var result = db.sessions.deleteMany({
            expiresAt: { \$lt: new Date() }
        });
        print('ลบ expired sessions: ' + result.deletedCount + ' records');
    " 2>/dev/null
    
    # ลบ logs เก่า
    local cutoff_date=$(date -d "$days days ago" '+%Y-%m-%d')
    for db in "${DATABASES[@]}"; do
        docker exec gacp-mongodb mongosh "$db" --eval "
            if (db.logs) {
                var result = db.logs.deleteMany({
                    createdAt: { \$lt: new Date('$cutoff_date') }
                });
                print('[$db] ลบ old logs: ' + result.deletedCount + ' records');
            }
        " 2>/dev/null
    done
    
    log_success "ทำความสะอาดฐานข้อมูลเรียบร้อย"
}

optimize_database() {
    check_mongodb || return 1
    
    log_header "ปรับปรุงประสิทธิภาพฐานข้อมูล"
    
    for db in "${DATABASES[@]}"; do
        log_info "ปรับปรุงฐานข้อมูล: $db"
        
        docker exec gacp-mongodb mongosh "$db" --eval "
            // รัน compact สำหรับทุก collection
            db.runCommand('listCollections').cursor.firstBatch.forEach(function(collection) {
                if (collection.name.indexOf('system.') !== 0) {
                    print('Compacting: ' + collection.name);
                    db.runCommand({compact: collection.name});
                }
            });
            
            // อัปเดต statistics
            db.runCommand({planCacheClear: '*'});
            print('✓ Database $db optimized');
        " 2>/dev/null
    done
    
    log_success "ปรับปรุงประสิทธิภาพฐานข้อมูลเรียบร้อย"
}

# Monitoring Functions
show_database_status() {
    check_mongodb || return 1
    
    log_header "สถานะฐานข้อมูล"
    
    echo -e "${CYAN}MongoDB Server Info:${NC}"
    docker exec gacp-mongodb mongosh --eval "
        var info = db.runCommand('buildInfo');
        print('Version: ' + info.version);
        print('Platform: ' + info.buildEnvironment.target_arch);
    " 2>/dev/null
    
    echo
    echo -e "${CYAN}Database Statistics:${NC}"
    printf "%-20s %-15s %-15s %-15s\n" "DATABASE" "COLLECTIONS" "DOCUMENTS" "SIZE (MB)"
    echo "=================================================================="
    
    for db in "${DATABASES[@]}"; do
        docker exec gacp-mongodb mongosh "$db" --quiet --eval "
            var stats = db.stats();
            var collections = db.runCommand('listCollections').cursor.firstBatch.length;
            var documents = 0;
            
            db.runCommand('listCollections').cursor.firstBatch.forEach(function(collection) {
                if (collection.name.indexOf('system.') !== 0) {
                    documents += db[collection.name].countDocuments();
                }
            });
            
            print('$db,' + collections + ',' + documents + ',' + Math.round(stats.dataSize / 1024 / 1024 * 100) / 100);
        " 2>/dev/null | while read line; do
            if [[ "$line" == *","* ]]; then
                IFS=',' read -r db_name colls docs size <<< "$line"
                printf "%-20s %-15s %-15s %-15s\n" "$db_name" "$colls" "$docs" "$size"
            fi
        done
    done
}

show_help() {
    echo -e "${CYAN}GACP Database Manager${NC}"
    echo -e "${CYAN}=====================${NC}"
    echo
    echo "การใช้งาน: $0 <command> [options]"
    echo
    echo "Commands:"
    echo "  init                    - เริ่มต้นฐานข้อมูลทั้งหมด"
    echo "  status                  - แสดงสถานะฐานข้อมูล"
    echo "  backup [database]       - สำรองข้อมูล (ทั้งหมดหรือตามที่ระบุ)"
    echo "  restore <backup_file>   - กู้คืนข้อมูลจากไฟล์สำรอง"
    echo "  cleanup [days]          - ทำความสะอาดข้อมูลเก่า (default: 30 วัน)"
    echo "  optimize                - ปรับปรุงประสิทธิภาพฐานข้อมูล"
    echo
    echo "Databases:"
    for db in "${DATABASES[@]}"; do
        echo "  $db"
    done
    echo
    echo "ตัวอย่าง:"
    echo "  $0 init                 # เริ่มต้นฐานข้อมูลทั้งหมด"
    echo "  $0 backup               # สำรองข้อมูลทั้งหมด"
    echo "  $0 backup gacp_auth     # สำรองข้อมูลเฉพาะ auth"
    echo "  $0 cleanup 7            # ลบข้อมูลเก่ากว่า 7 วัน"
    echo "  $0 status               # แสดงสถานะฐานข้อมูล"
}

# Main Function
main() {
    local command=${1:-"help"}
    local option=${2:-""}
    
    case $command in
        "init")
            init_databases
            ;;
        "status")
            show_database_status
            ;;
        "backup")
            backup_database "$option"
            ;;
        "restore")
            if [[ -z "$option" ]]; then
                log_error "กรุณาระบุไฟล์สำรอง"
                echo "ใช้งาน: $0 restore <backup_file>"
                return 1
            fi
            restore_database "$option"
            ;;
        "cleanup")
            cleanup_database "$option"
            ;;
        "optimize")
            optimize_database
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# เรียกใช้ main function
main "$@"