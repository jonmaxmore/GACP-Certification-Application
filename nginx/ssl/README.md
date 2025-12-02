# This directory contains SSL/TLS certificates for Nginx

## For Development (Self-Signed)

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout privkey.pem \
  -out fullchain.pem \
  -subj "/C=US/ST=State/L=City/O=GACP/CN=*.localhost"
```

## For Production (Let's Encrypt)

```bash
sudo certbot certonly --standalone \
  -d farmer.yourdomain.com \
  -d admin.yourdomain.com \
  -d cert.yourdomain.com \
  -d api.yourdomain.com \
  --email admin@yourdomain.com

sudo cp /etc/letsencrypt/live/farmer.yourdomain.com/fullchain.pem ./
sudo cp /etc/letsencrypt/live/farmer.yourdomain.com/privkey.pem ./
```

## Required Files

- `fullchain.pem` - Full certificate chain
- `privkey.pem` - Private key

⚠️ **Never commit these files to version control!**
