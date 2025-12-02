# AWS VPC Environment Setup

## สถานการณ์ปัจจุบัน

EC2 IP: 47.130.0.164 เข้าไม่ได้ → อาจอยู่ใน Private Subnet

## วิธีแก้ไข

### ตัวเลือกที่ 1: ย้าย EC2 ไป Public Subnet (ง่ายที่สุด)

1. **สร้าง EC2 ใหม่:**
   - Launch Instance
   - Network Settings → **Edit**
   - VPC: เลือก VPC ของคุณ
   - Subnet: เลือก **Public Subnet**
   - Auto-assign Public IP: **Enable**
   - Security Group: เปิด ports 22, 80, 443

2. **เช็ค Route Table:**
   - VPC Console → Route Tables
   - เลือก Route Table ของ Public Subnet
   - Routes ต้องมี: `0.0.0.0/0` → `igw-xxxxx` (Internet Gateway)

3. **เช็ค Internet Gateway:**
   - VPC Console → Internet Gateways
   - ต้องมี IGW attached กับ VPC

---

### ตัวเลือกที่ 2: ใช้ Application Load Balancer

```
Internet → ALB (Public Subnet) → EC2 (Private Subnet)
```

**ขั้นตอน:**

1. **สร้าง Application Load Balancer:**
   - EC2 Console → Load Balancers → Create
   - Type: Application Load Balancer
   - Scheme: **Internet-facing**
   - Network: เลือก VPC และ **Public Subnets** (อย่างน้อย 2 AZs)

2. **สร้าง Target Group:**
   - Target type: Instances
   - Protocol: HTTP, Port: 80
   - Health check: `/health`
   - Register EC2 instance

3. **สร้าง Listener:**
   - Protocol: HTTP, Port: 80
   - Forward to: Target Group ที่สร้าง

4. **เข้าผ่าน ALB DNS:**
   ```
   http://gacp-alb-xxxxx.ap-southeast-1.elb.amazonaws.com/health
   ```

---

### ตัวเลือกที่ 3: ใช้ NAT Gateway + Elastic IP

**สำหรับ EC2 ใน Private Subnet ที่ต้องการ outbound internet:**

1. **สร้าง NAT Gateway:**
   - VPC Console → NAT Gateways → Create
   - Subnet: **Public Subnet**
   - Elastic IP: Allocate new

2. **อัพเดท Route Table (Private Subnet):**
   - Destination: `0.0.0.0/0`
   - Target: NAT Gateway

3. **ใช้ ALB หรือ CloudFront สำหรับ inbound traffic**

---

## เช็คสถานะปัจจุบัน

### 1. เช็คว่า EC2 อยู่ใน Subnet ไหน

```bash
# ใน AWS Console
EC2 → Instances → เลือก instance
→ Networking tab → Subnet ID
```

### 2. เช็ค Subnet Type

```bash
VPC → Subnets → เลือก Subnet
→ Route table → Routes
```

**Public Subnet:** มี route `0.0.0.0/0` → `igw-xxxxx`
**Private Subnet:** มี route `0.0.0.0/0` → `nat-xxxxx` หรือไม่มี

### 3. เช็ค Security Group

```bash
EC2 → Security Groups → เลือก SG
→ Inbound rules
```

ต้องมี:
- Type: HTTP, Port: 80, Source: 0.0.0.0/0
- Type: SSH, Port: 22, Source: My IP

---

## แนะนำสำหรับ Production

```
┌─────────────────────────────────────────┐
│           Internet                       │
└──────────────┬──────────────────────────┘
               │
        ┌──────▼──────┐
        │   Route 53   │ (DNS)
        └──────┬──────┘
               │
        ┌──────▼──────┐
        │ CloudFront   │ (CDN)
        └──────┬──────┘
               │
        ┌──────▼──────┐
        │     ALB      │ (Load Balancer)
        │ Public Subnet│
        └──────┬──────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────┐          ┌────▼───┐
│  EC2   │          │  EC2   │
│Private │          │Private │
│Subnet  │          │Subnet  │
└───┬────┘          └────┬───┘
    │                    │
    └──────────┬─────────┘
               │
        ┌──────▼──────┐
        │   MongoDB   │
        │    Atlas    │
        └─────────────┘
```

---

## Quick Fix: สร้าง EC2 ใหม่ใน Public Subnet

**คำสั่งเดียว (AWS CLI):**

```bash
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t2.medium \
  --key-name gacp-server-key \
  --security-group-ids sg-xxxxx \
  --subnet-id subnet-xxxxx \
  --associate-public-ip-address \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=gacp-backend-public}]'
```

---

## ค่าใช้จ่าย

| Service | ราคา/เดือน |
|---------|-----------|
| EC2 t2.medium | $34 |
| ALB | $16 |
| NAT Gateway | $32 |
| Elastic IP | $3.6 (ถ้าไม่ใช้) |

**แนะนำ:** ใช้ EC2 ใน Public Subnet = $34/เดือน (ถูกที่สุด)

---

## ต้องการความช่วยเหลือ?

บอกผมว่า:
1. EC2 อยู่ใน Subnet ID อะไร
2. Subnet นั้นเป็น Public หรือ Private
3. มี Internet Gateway หรือไม่

ผมจะช่วยแก้ไขให้ครับ
