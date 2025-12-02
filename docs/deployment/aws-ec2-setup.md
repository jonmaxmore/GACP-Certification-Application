# 🚀 AWS EC2 Setup และ Deploy

## ขั้นตอนที่ 1: สร้าง EC2 Instance

### 1.1 เข้า AWS Console
```
https://ap-southeast-1.console.aws.amazon.com/ec2
```

### 1.2 Launch Instance
1. คลิก **"Launch Instance"**
2. ตั้งชื่อ: `gacp-backend-server`

### 1.3 เลือก AMI (Operating System)
- **Amazon Linux 2023** (Free Tier eligible)
- หรือ **Ubuntu Server 22.04 LTS** (แนะนำ)

### 1.4 เลือก Instance Type
- **t2.medium** (4 GB RAM) - แนะนำสำหรับ production
- หรือ **t2.small** (2 GB RAM) - สำหรับทดสอบ
- หรือ **t2.micro** (1 GB RAM) - Free Tier แต่อาจช้า

### 1.5 Key Pair (สำคัญ!)
1. คลิก **"Create new key pair"**
2. ชื่อ: `gacp-server-key`
3. Type: **RSA**
4. Format: **`.pem`** (สำหรับ SSH)
5. คลิก **"Create key pair"**
6. **บันทึกไฟล์ `.pem` ไว้ในที่ปลอดภัย!**

### 1.6 Network Settings
1. คลิก **"Edit"**
2. เปิด ports:
   - ✅ SSH (22) - My IP
   - ✅ HTTP (80) - Anywhere
   - ✅ HTTPS (443) - Anywhere
   - ✅ Custom TCP (3000) - Anywhere (Backend API)

### 1.7 Storage
- **20 GB** gp3 (แนะนำ)
- หรือ **30 GB** gp3 (ถ้าต้องการพื้นที่เยอะ)

### 1.8 Launch
คลิก **"Launch Instance"**

รอ 2-3 นาที จนสถานะเป็น **"Running"**

---

## ขั้นตอนที่ 2: เชื่อมต่อ EC2

### 2.1 หา Public IP
1. เลือก instance ที่สร้าง
2. คัดลอก **"Public IPv4 address"** (เช่น `13.250.123.45`)

### 2.2 เชื่อมต่อผ่าน SSH

**Windows (PowerShell):**
```powershell
# ย้ายไฟล์ .pem ไปที่ C:\Users\usEr\.ssh\
Move-Item "C:\Users\usEr\Downloads\gacp-server-key.pem" "C:\Users\usEr\.ssh\"

# ตั้งค่า permissions
icacls "C:\Users\usEr\.ssh\gacp-server-key.pem" /inheritance:r
icacls "C:\Users\usEr\.ssh\gacp-server-key.pem" /grant:r "$($env:USERNAME):(R)"

# เชื่อมต่อ (แทน IP ด้วย Public IP ของคุณ)
ssh -i "C:\Users\usEr\.ssh\gacp-server-key.pem" ubuntu@13.250.123.45
```

**หรือใช้ AWS Console Connect:**
1. เลือก instance
2. คลิก **"Connect"**
3. เลือก **"EC2 Instance Connect"**
4. คลิก **"Connect"**

---

## ขั้นตอนที่ 3: ติดตั้ง Software บน EC2

### 3.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 3.2 ติดตั้ง Node.js 18
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # ควรได้ v18.x.x
```

### 3.3 ติดตั้ง PNPM
```bash
sudo npm install -g pnpm
pnpm --version
```

### 3.4 ติดตั้ง PM2
```bash
sudo npm install -g pm2
pm2 --version
```

### 3.5 ติดตั้ง Git
```bash
sudo apt install -y git
git --version
```

### 3.6 ติดตั้ง Nginx (Reverse Proxy)
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## ขั้นตอนที่ 4: Clone และ Setup Project

### 4.1 Clone Repository
```bash
cd /home/ubuntu
git clone https://github.com/jonmaxmore/Botanical-Audit-Framework.git
cd Botanical-Audit-Framework
```

### 4.2 Install Dependencies
```bash
pnpm install
```

### 4.3 สร้าง .env File
```bash
cd apps/backend
nano .env
```

**วาง config นี้:**
```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://gacp-premierprime:qwer1234@thai-gacp.re1651p.mongodb.net/gacp-platform?retryWrites=true&w=majority&appName=thai-gacp

# JWT Secrets (สร้างใหม่ด้วย openssl)
JWT_SECRET_FARMER=your-farmer-secret-here
JWT_SECRET_DTAM=your-dtam-secret-here

# Server
NODE_ENV=production
PORT=3000

# Redis (ถ้ามี)
REDIS_URL=redis://localhost:6379
```

**บันทึก:** `Ctrl+X` → `Y` → `Enter`

### 4.4 สร้าง JWT Secrets
```bash
# สร้าง secrets แบบสุ่ม
openssl rand -hex 64
# คัดลอกผลลัพธ์ใส่ใน JWT_SECRET_FARMER

openssl rand -hex 64
# คัดลอกผลลัพธ์ใส่ใน JWT_SECRET_DTAM

# แก้ไข .env อีกครั้ง
nano .env
```

---

## ขั้นตอนที่ 5: Start Backend ด้วย PM2

### 5.1 Start Server
```bash
cd /home/ubuntu/Botanical-Audit-Framework/apps/backend
pm2 start server.js --name gacp-backend
```

### 5.2 ตรวจสอบสถานะ
```bash
pm2 status
pm2 logs gacp-backend
```

### 5.3 ตั้งค่า Auto-start
```bash
pm2 startup
# คัดลอกคำสั่งที่แสดง แล้วรันอีกครั้ง

pm2 save
```

---

## ขั้นตอนที่ 6: ตั้งค่า Nginx Reverse Proxy

### 6.1 สร้าง Config
```bash
sudo nano /etc/nginx/sites-available/gacp
```

**วาง config นี้:**
```nginx
server {
    listen 80;
    server_name _;

    location / {
    proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**บันทึก:** `Ctrl+X` → `Y` → `Enter`

### 6.2 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/gacp /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## ขั้นตอนที่ 7: ทดสอบ

### 7.1 ทดสอบจาก Browser
```
http://YOUR_PUBLIC_IP/health
http://YOUR_PUBLIC_IP/api/health
```

ควรได้:
```json
{
  "status": "ok",
  "timestamp": "2025-01-28T..."
}
```

### 7.2 ทดสอบ API
```bash
curl http://localhost:5000/health
```

---

## ขั้นตอนที่ 8: Deploy Frontend (Optional)

### 8.1 Build Frontend
```bash
cd /home/ubuntu/Botanical-Audit-Framework/apps/farmer-portal
pnpm build
```

### 8.2 Start Frontend
```bash
pm2 start npm --name gacp-frontend -- start
pm2 save
```

### 8.3 Update Nginx Config
```bash
sudo nano /etc/nginx/sites-available/gacp
```

**เพิ่ม location สำหรับ frontend:**
```nginx
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## คำสั่งที่ใช้บ่อย

### PM2 Commands
```bash
pm2 status                    # ดูสถานะ
pm2 logs gacp-backend         # ดู logs
pm2 restart gacp-backend      # restart
pm2 stop gacp-backend         # หยุด
pm2 delete gacp-backend       # ลบ
pm2 monit                     # monitor real-time
```

### Nginx Commands
```bash
sudo systemctl status nginx   # ดูสถานะ
sudo systemctl restart nginx  # restart
sudo nginx -t                 # ทดสอบ config
sudo tail -f /var/log/nginx/error.log  # ดู error log
```

### System Commands
```bash
htop                          # ดู CPU/RAM
df -h                         # ดู disk space
free -h                       # ดู memory
```

---

## 💰 ค่าใช้จ่าย AWS

| Instance Type | RAM  | vCPU | ราคา/เดือน (ap-southeast-1) |
|---------------|------|------|------------------------------|
| t2.micro      | 1 GB | 1    | $8.50 (Free Tier: ฟรี)       |
| t2.small      | 2 GB | 1    | $17                          |
| t2.medium     | 4 GB | 2    | $34 (แนะนำ)                  |
| t2.large      | 8 GB | 2    | $68                          |

**Storage:** $0.10/GB/เดือน (20 GB = $2/เดือน)

**รวม (t2.medium):** ~$36/เดือน

---

## 🔒 Security Best Practices

### 1. เปลี่ยน SSH Port (Optional)
```bash
sudo nano /etc/ssh/sshd_config
# เปลี่ยน Port 22 เป็น 2222
sudo systemctl restart sshd
```

### 2. ตั้งค่า Firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw enable
```

### 3. Update Security Group
ใน AWS Console → EC2 → Security Groups:
- ลบ port 3000 ออก (ใช้ Nginx แทน)
- เปลี่ยน SSH เป็น "My IP" เท่านั้น

---

## 🆘 Troubleshooting

### Backend ไม่ทำงาน
```bash
pm2 logs gacp-backend --lines 100
```

### Nginx Error
```bash
sudo tail -f /var/log/nginx/error.log
```

### MongoDB Connection Error
- เช็ค Network Access ใน MongoDB Atlas
- เพิ่ม EC2 Public IP ใน IP Whitelist

### Out of Memory
```bash
# เพิ่ม swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 📝 Next Steps

1. ✅ ตั้งค่า Domain Name (Route 53)
2. ✅ ติดตั้ง SSL Certificate (Let's Encrypt)
3. ✅ ตั้งค่า Auto Backup
4. ✅ ตั้งค่า CloudWatch Monitoring
5. ✅ ตั้งค่า Auto Scaling (ถ้าจำเป็น)

---

**เวลาที่ใช้ทั้งหมด:** 30-45 นาที

**พร้อม deploy แล้ว!** 🚀
