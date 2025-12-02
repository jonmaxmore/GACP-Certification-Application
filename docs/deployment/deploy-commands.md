# 🚀 Deploy Commands for EC2: 13.250.13.249

## Step 1: เชื่อมต่อ SSH

```powershell
# ย้ายไฟล์ .pem (ถ้ายังไม่ได้ทำ)
Move-Item "C:\Users\usEr\Downloads\*.pem" "C:\Users\usEr\.ssh\"

# ตั้งค่า permissions
icacls "C:\Users\usEr\.ssh\gacp-server-key.pem" /inheritance:r
icacls "C:\Users\usEr\.ssh\gacp-server-key.pem" /grant:r "$($env:USERNAME):(R)"

# เชื่อมต่อ
ssh -i "C:\Users\usEr\.ssh\gacp-server-key.pem" ubuntu@13.250.13.249
```

---

## Step 2: ติดตั้ง Software (รันทีละคำสั่ง)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version

# PNPM
sudo npm install -g pnpm
pnpm --version

# PM2
sudo npm install -g pm2
pm2 --version

# Git
sudo apt install -y git

# Nginx
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## Step 3: Clone Project

```bash
cd /home/ubuntu
git clone https://github.com/jonmaxmore/Botanical-Audit-Framework.git
cd Botanical-Audit-Framework
pnpm install
```

---

## Step 4: สร้าง .env

```bash
cd apps/backend
nano .env
```

**วาง config นี้:**
```env
MONGODB_URI=mongodb+srv://gacp-premierprime:qwer1234@thai-gacp.re1651p.mongodb.net/gacp-platform?retryWrites=true&w=majority&appName=thai-gacp
NODE_ENV=production
PORT=3000
```

**สร้าง JWT Secrets:**
```bash
# สร้าง secret 1
openssl rand -hex 64

# สร้าง secret 2
openssl rand -hex 64
```

**แก้ไข .env เพิ่ม secrets:**
```bash
nano .env
```

เพิ่ม:
```env
JWT_SECRET_FARMER=<secret-1>
JWT_SECRET_DTAM=<secret-2>
```

บันทึก: `Ctrl+X` → `Y` → `Enter`

---

## Step 5: Start Backend

```bash
cd /home/ubuntu/Botanical-Audit-Framework/apps/backend
pm2 start server.js --name gacp-backend
pm2 status
pm2 logs gacp-backend
```

**ตั้งค่า auto-start:**
```bash
pm2 startup
# รันคำสั่งที่แสดง (sudo env PATH=...)
pm2 save
```

---

## Step 6: ตั้งค่า Nginx

```bash
sudo nano /etc/nginx/sites-available/gacp
```

**วาง config:**
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

**Enable:**
```bash
sudo ln -s /etc/nginx/sites-available/gacp /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 7: เพิ่ม EC2 IP ใน MongoDB Atlas

1. เข้า https://cloud.mongodb.com
2. Network Access → Add IP Address
3. เพิ่ม: `13.250.13.249`
4. หรือ: `0.0.0.0/0` (Allow all)

---

## Step 8: ทดสอบ

**จาก Browser:**
```
http://13.250.13.249/health
http://13.250.13.249/api/health
```

**จาก SSH:**
```bash
curl http://localhost:5000/health
```

---

## คำสั่งที่ใช้บ่อย

```bash
# ดู logs
pm2 logs gacp-backend

# Restart
pm2 restart gacp-backend

# Monitor
pm2 monit

# ดู system resources
htop

# ดู nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

## 🎯 Quick Test URLs

- Health: http://13.250.13.249/health
- API Health: http://13.250.13.249/api/health
- API Docs: http://13.250.13.249/api-docs

---

## 🆘 Troubleshooting

**Backend ไม่ start:**
```bash
pm2 logs gacp-backend --lines 50
```

**MongoDB connection error:**
```bash
# เช็คว่า MongoDB Atlas Network Access เปิด 13.250.13.249 แล้ว
```

**Nginx 502 error:**
```bash
# เช็คว่า backend running
pm2 status

# Restart backend
pm2 restart gacp-backend
```

---

**Your EC2 is ready!** 🚀
