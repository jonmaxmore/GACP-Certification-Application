# ✅ AWS Deployment Checklist

## Pre-Deployment

- [ ] มี AWS Account แล้ว
- [ ] เข้า AWS Console ได้: https://ap-southeast-1.console.aws.amazon.com
- [ ] มี GitHub repository access
- [ ] MongoDB Atlas Network Access เปิดแล้ว

---

## Step 1: สร้าง EC2 Instance (5 นาที)

- [ ] Launch Instance
- [ ] ชื่อ: `gacp-backend-server`
- [ ] AMI: Ubuntu Server 22.04 LTS
- [ ] Instance Type: **t2.medium** (แนะนำ)
- [ ] Create Key Pair: `gacp-server-key.pem`
- [ ] **บันทึกไฟล์ .pem ไว้!**
- [ ] Security Group เปิด ports: 22, 80, 443, 3000
- [ ] Storage: 20 GB gp3
- [ ] Launch Instance
- [ ] รอจนสถานะ **Running**
- [ ] คัดลอก **Public IP**

---

## Step 2: เชื่อมต่อ EC2 (2 นาที)

**Windows PowerShell:**
```powershell
# ย้ายไฟล์ .pem
Move-Item "C:\Users\usEr\Downloads\gacp-server-key.pem" "C:\Users\usEr\.ssh\"

# ตั้งค่า permissions
icacls "C:\Users\usEr\.ssh\gacp-server-key.pem" /inheritance:r
icacls "C:\Users\usEr\.ssh\gacp-server-key.pem" /grant:r "$($env:USERNAME):(R)"

# เชื่อมต่อ (แทน YOUR_IP)
ssh -i "C:\Users\usEr\.ssh\gacp-server-key.pem" ubuntu@YOUR_PUBLIC_IP
```

- [ ] เชื่อมต่อ SSH สำเร็จ

---

## Step 3: ติดตั้ง Software (10 นาที)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# PNPM
sudo npm install -g pnpm

# PM2
sudo npm install -g pm2

# Git
sudo apt install -y git

# Nginx
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

- [ ] Node.js ติดตั้งแล้ว (`node --version`)
- [ ] PNPM ติดตั้งแล้ว (`pnpm --version`)
- [ ] PM2 ติดตั้งแล้ว (`pm2 --version`)
- [ ] Git ติดตั้งแล้ว (`git --version`)
- [ ] Nginx ทำงานแล้ว (`sudo systemctl status nginx`)

---

## Step 4: Clone Project (3 นาที)

```bash
cd /home/ubuntu
git clone https://github.com/jonmaxmore/Botanical-Audit-Framework.git
cd Botanical-Audit-Framework
pnpm install
```

- [ ] Clone repository สำเร็จ
- [ ] Install dependencies สำเร็จ

---

## Step 5: สร้าง .env File (5 นาที)

```bash
cd apps/backend
nano .env
```

**วาง config:**
```env
MONGODB_URI=mongodb+srv://gacp-premierprime:qwer1234@thai-gacp.re1651p.mongodb.net/gacp-platform?retryWrites=true&w=majority&appName=thai-gacp
JWT_SECRET_FARMER=<สร้างด้วย openssl>
JWT_SECRET_DTAM=<สร้างด้วย openssl>
NODE_ENV=production
PORT=3000
```

**สร้าง JWT Secrets:**
```bash
openssl rand -hex 64  # สำหรับ JWT_SECRET_FARMER
openssl rand -hex 64  # สำหรับ JWT_SECRET_DTAM
```

- [ ] .env file สร้างแล้ว
- [ ] JWT secrets สร้างแล้ว
- [ ] MongoDB URI ใส่แล้ว

---

## Step 6: Start Backend (2 นาที)

```bash
cd /home/ubuntu/Botanical-Audit-Framework/apps/backend
pm2 start server.js --name gacp-backend
pm2 status
pm2 logs gacp-backend
```

**ตั้งค่า auto-start:**
```bash
pm2 startup
# รันคำสั่งที่แสดง
pm2 save
```

- [ ] Backend start สำเร็จ
- [ ] PM2 status แสดง "online"
- [ ] ไม่มี error ใน logs
- [ ] Auto-start ตั้งค่าแล้ว

---

## Step 7: ตั้งค่า Nginx (3 นาที)

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

**Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/gacp /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

- [ ] Nginx config สร้างแล้ว
- [ ] nginx -t ผ่าน (no errors)
- [ ] Nginx restart สำเร็จ

---

## Step 8: ทดสอบ (2 นาที)

**ทดสอบจาก Browser:**
```
http://YOUR_PUBLIC_IP/health
http://YOUR_PUBLIC_IP/api/health
```

**ทดสอบจาก SSH:**
```bash
curl http://localhost:5000/health
```

- [ ] `/health` ตอบกลับ `{"status":"ok"}`
- [ ] `/api/health` ตอบกลับ `{"status":"ok"}`
- [ ] ไม่มี error 502/504

---

## Step 9: MongoDB Network Access (1 นาที)

1. เข้า MongoDB Atlas: https://cloud.mongodb.com
2. Network Access → Add IP Address
3. เพิ่ม EC2 Public IP
4. หรือเลือก "Allow Access from Anywhere" (0.0.0.0/0)

- [ ] EC2 IP เพิ่มใน MongoDB Atlas แล้ว
- [ ] Backend เชื่อมต่อ MongoDB ได้

---

## Post-Deployment Verification

### ทดสอบ API Endpoints

```bash
# Health check
curl http://YOUR_PUBLIC_IP/health

# API health
curl http://YOUR_PUBLIC_IP/api/health

# Test farmer registration (optional)
curl -X POST http://YOUR_PUBLIC_IP/api/auth/farmer/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234!","name":"Test User"}'
```

- [ ] Health endpoints ทำงาน
- [ ] API endpoints ตอบกลับถูกต้อง

---

## Security Hardening (Optional)

```bash
# Firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Remove port 3000 from Security Group
# (ใช้ Nginx reverse proxy แทน)
```

- [ ] UFW firewall เปิดแล้ว
- [ ] Security Group ปรับแล้ว

---

## Monitoring Setup (Optional)

```bash
# PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# System monitoring
sudo apt install -y htop
```

- [ ] Log rotation ตั้งค่าแล้ว
- [ ] Monitoring tools ติดตั้งแล้ว

---

## 🎉 Deployment Complete!

**Your API is live at:**
```
http://YOUR_PUBLIC_IP
```

**Useful Commands:**
```bash
# View logs
pm2 logs gacp-backend

# Restart
pm2 restart gacp-backend

# Monitor
pm2 monit

# System resources
htop
```

---

## 📊 Summary

| Task                    | Time     | Status |
|-------------------------|----------|--------|
| Create EC2              | 5 min    | [ ]    |
| Connect SSH             | 2 min    | [ ]    |
| Install Software        | 10 min   | [ ]    |
| Clone Project           | 3 min    | [ ]    |
| Configure .env          | 5 min    | [ ]    |
| Start Backend           | 2 min    | [ ]    |
| Setup Nginx             | 3 min    | [ ]    |
| Test Deployment         | 2 min    | [ ]    |
| MongoDB Access          | 1 min    | [ ]    |
| **Total**               | **33 min** | [ ]  |

---

## 💰 Monthly Cost Estimate

- EC2 t2.medium: $34/month
- Storage 20GB: $2/month
- Data Transfer: ~$5/month
- **Total: ~$41/month**

(Free Tier: t2.micro ฟรี 750 ชั่วโมง/เดือน ปีแรก)

---

## 🆘 Need Help?

**Common Issues:**
- Backend ไม่ start → `pm2 logs gacp-backend`
- MongoDB connection error → เช็ค Network Access
- Nginx 502 error → เช็ค backend running (`pm2 status`)
- Out of memory → เพิ่ม swap space (ดู AWS_EC2_SETUP.md)

**Documentation:**
- Full guide: `AWS_EC2_SETUP.md`
- Console deployment: `AWS_CONSOLE_DEPLOYMENT.md`
