#!/bin/bash
set -e

echo "🏗️  GACP Platform - Infrastructure Setup"

cd ../../infrastructure/aws

echo "Step 1: Initialize Terraform..."
terraform init

echo "Step 2: Create ECR repository..."
aws ecr create-repository --repository-name gacp-backend --region ap-southeast-1 || echo "Repository exists"

echo "Step 3: Deploy secrets..."
terraform apply -target=aws_secretsmanager_secret.gacp_production -auto-approve
terraform apply -target=aws_secretsmanager_secret_version.gacp_production_version -auto-approve

echo "Step 4: Deploy infrastructure..."
terraform plan -out=tfplan
terraform apply tfplan

echo "Step 5: Get outputs..."
terraform output

echo "✅ Infrastructure setup complete!"
