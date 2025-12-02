#!/bin/bash
set -e

echo "🚀 GACP Platform - AWS Deployment"

AWS_REGION=${AWS_REGION:-ap-southeast-1}
echo "Region: $AWS_REGION"
ENVIRONMENT=${ENVIRONMENT:-production}
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPOSITORY="gacp-backend"

echo "Building Docker image..."
cd ../../apps/backend
docker build -t $ECR_REPOSITORY:latest .

echo "Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

echo "Pushing to ECR..."
docker tag $ECR_REPOSITORY:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest

echo "Updating ECS service..."
aws ecs update-service \
  --cluster gacp-cluster-$ENVIRONMENT \
  --service gacp-backend \
  --force-new-deployment \
  --region $AWS_REGION

echo "✅ Deployment complete!"
