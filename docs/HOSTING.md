# Loksewa AI — Complete Hosting Guide

> **Production deployment handbook for RhinoPeak Labs Nepal's AI Learning Operating System**

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture Diagrams](#2-architecture-diagrams)
3. [Infrastructure Requirements](#3-infrastructure-requirements)
4. [Local Development Setup](#4-local-development-setup)
5. [Production Deployment Options](#5-production-deployment-options)
6. [Kubernetes Deployment](#6-kubernetes-deployment)
7. [Cloud Provider Specific Guides](#7-cloud-provider-specific-guides)
8. [CI/CD Pipeline](#8-cicd-pipeline)
9. [Monitoring & Observability](#9-monitoring--observability)
10. [Scaling Strategy](#10-scaling-strategy)
11. [Security Hardening](#11-security-hardening)
12. [Backup & Disaster Recovery](#12-backup--disaster-recovery)
13. [Cost Optimization](#13-cost-optimization)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Overview

Loksewa AI is a cloud-native, microservices-based platform consisting of:

- **13 backend microservices** (Node.js + Python)
- **3 frontend applications** (Flutter mobile, Next.js web, React admin)
- **Polyglot persistence** (PostgreSQL, Redis, Qdrant, S3)
- **Event-driven architecture** (Apache Kafka)
- **API Gateway** (Kong)
- **AI/ML infrastructure** (GPU clusters, vector DB)

This guide covers the complete hosting lifecycle from local development to production deployment on Kubernetes.

---

## 2. Architecture Diagrams

### 2.1 High-Level System Architecture

```
                          ┌──────────────────────┐
                          │      USERS           │
                          │  Students | Admins   │
                          │  Mobile | Web        │
                          └──────────┬───────────┘
                                     │
                                     ▼
                        ┌────────────────────────┐
                        │   Cloudflare CDN/WAF   │
                        │   (DDoS, SSL, Cache)   │
                        └────────────┬───────────┘
                                     │
                                     ▼
                        ┌────────────────────────┐
                        │   Kong API Gateway     │
                        │  Auth | Rate | Route   │
                        └────────────┬───────────┘
                                     │
        ┌──────────────┬─────────────┼──────────────┬──────────────┐
        ▼              ▼             ▼              ▼              ▼
  ┌─────────┐  ┌────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │  Auth   │  │  Learning  │  │   AI     │  │  Admin   │  │ Analytics│
  │ Service │  │  Service   │  │ Service  │  │ Service  │  │ Service  │
  │ :3001   │  │   :3003    │  │  :3006   │  │  :3005   │  │  :3011   │
  └────┬────┘  └─────┬──────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘
       │              │              │              │              │
       └──────────────┴──────┬───────┴──────────────┴──────────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │   Event Bus (Kafka)  │
                   └──────────┬───────────┘
                              │
        ┌──────────────┬──────┴───────┬──────────────┐
        ▼              ▼              ▼              ▼
  ┌─────────┐  ┌────────────┐  ┌──────────┐  ┌──────────┐
  │Postgres │  │   Redis    │  │  Qdrant  │  │   S3     │
  │ Cluster │  │  Cluster   │  │ Cluster  │  │  Bucket  │
  └─────────┘  └────────────┘  └──────────┘  └──────────┘
                                                 │
                                                 ▼
                                        ┌──────────────────┐
                                        │   AI Cluster     │
                                        │ Qwen / Llama /   │
                                        │ RhinoPeak        │
                                        └──────────────────┘
```

### 2.2 Service Communication Pattern

```
┌────────────────────────────────────────────────────────────────────┐
│                    SYNCHRONOUS (HTTP/gRPC)                          │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Client ──► Kong Gateway ──► Service A ──► Service B              │
│                  │                │             │                   │
│                  │                ▼             ▼                   │
│                  │           PostgreSQL    Redis Cache              │
│                  │                                                    │
│                  └─────► JWT Validation                             │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                    ASYNCHRONOUS (Kafka Events)                      │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Service A ──► Kafka Topic ──► Service B (Consumer)              │
│       │            │                    │                          │
│       │            │                    ▼                          │
│       │            │             PostgreSQL                        │
│       │            │                    │                          │
│       ▼            ▼                    ▼                          │
│   Outbox ──► CDC ──► Topic ──► Analytics Service                  │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### 2.3 Network Topology

```
                    ┌─────────────────────────────────┐
                    │       PUBLIC INTERNET           │
                    └────────────┬────────────────────┘
                                 │
                    ┌────────────▼────────────────┐
                    │   EDGE NETWORK (DMZ)        │
                    │  - Cloudflare WAF/CDN      │
                    │  - DDoS Protection         │
                    │  - SSL Termination         │
                    └────────────┬────────────────┘
                                 │
                    ┌────────────▼────────────────┐
                    │   DMZ SUBNET (Public)       │
                    │  - Kong API Gateway         │
                    │  - Bastion Host (SSH)       │
                    │  - VPN Gateway              │
                    └────────────┬────────────────┘
                                 │
                    ┌────────────▼────────────────┐
                    │  APPLICATION SUBNET         │
                    │  (Private, 10.0.1.0/24)     │
                    │  - Microservices (Pods)     │
                    │  - Ingress Controllers      │
                    │  - Service Mesh (Istio)     │
                    └────────────┬────────────────┘
                                 │
                    ┌────────────▼────────────────┐
                    │  DATA SUBNET (Private)      │
                    │  (10.0.2.0/24)              │
                    │  - PostgreSQL Primary       │
                    │  - PostgreSQL Replicas      │
                    │  - Redis Cluster            │
                    │  - Qdrant Cluster           │
                    │  - Kafka Brokers            │
                    │  - S3/MinIO                 │
                    └────────────┬────────────────┘
                                 │
                    ┌────────────▼────────────────┐
                    │  MANAGEMENT SUBNET          │
                    │  (10.0.3.0/24)              │
                    │  - Monitoring (Prometheus)  │
                    │  - Logging (Loki)           │
                    │  - Tracing (Jaeger)         │
                    │  - Backup Services          │
                    └─────────────────────────────┘
```

### 2.4 Deployment Pipeline Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  GitHub  │────►│   CI     │────►│  Build   │────►│   Test   │────►│  Deploy  │
│  Push    │     │ Trigger  │     │  Images  │     │  Suite   │     │  Stages  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘     └────┬─────┘
                                                                       │
                            ┌──────────────────────────────────────────┤
                            │                                          │
                            ▼                                          ▼
                    ┌──────────────┐                          ┌──────────────┐
                    │ Development  │                          │   Staging    │
                    │   (Auto)     │                          │  (Auto)      │
                    └──────────────┘                          └──────────────┘
                                                                       │
                            ┌──────────────────────────────────────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │   Production     │
                    │ (Manual Approval)│
                    │   Blue/Green     │
                    └──────────────────┘
```

### 2.5 Data Flow Architecture

```
┌─────────────┐
│   Student   │
│   Question  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐      ┌──────────────────┐
│  Learning Svc   │─────►│  PostgreSQL      │
│  (Update Skill) │      │  (user_progress) │
└────────┬────────┘      └──────────────────┘
         │
         │ Publish Event
         ▼
┌─────────────────┐
│  Kafka Topic    │
│  "question.     │
│  answered"      │
└────────┬────────┘
         │
    ┌────┴────────────────────────────┐
    │      │      │      │      │      │
    ▼      ▼      ▼      ▼      ▼      ▼
┌────────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐
│Game    ││Memory││Analy-││Notif-││AI    ││Found-│
│Service ││Svc   ││tics  ││Svc   ││Train ││ation │
└────────┘└──────┘└──────┘└──────┘└──────┘└──────┘
```

### 2.6 AI Brain Architecture (RAG Flow)

```
   Student Question (Nepali/English)
              │
              ▼
    ┌────────────────────┐
    │  Question Router   │
    └─────────┬──────────┘
              │
    ┌─────────┴──────────┐
    ▼                    ▼
 ┌─────────┐        ┌────────────┐
 │  FAQ    │        │   AI       │
 │ Route   │        │   Route    │
 │ (Cache) │        │            │
 └────┬────┘        └──────┬─────┘
      │                    │
      ▼                    ▼
 ┌──────────┐        ┌──────────────────┐
 │  Redis   │        │  Context Builder │
 │  Cache   │        └────────┬─────────┘
 └────┬─────┘                 │
      │              ┌────────┼────────┐
      │              ▼        ▼        ▼
      │        ┌────────┐ ┌──────┐ ┌──────┐
      │        │ User   │ │Know- │ │Live  │
      │        │Memory  │ │ledge │ │Lok-  │
      │        │Search  │ │Search│ │sewa  │
      │        │(Qdrant)│ │(Qdr.)│ │Tools │
      │        └────┬───┘ └──┬───┘ └──┬───┘
      │             │        │        │
      │             └────────┼────────┘
      │                      ▼
      │             ┌──────────────────┐
      │             │  Prompt Assembly │
      │             └────────┬─────────┘
      │                      ▼
      │             ┌──────────────────┐
      │             │   LLM (Qwen /    │
      │             │   Llama / future │
      │             │   RhinoPeak)     │
      │             └────────┬─────────┘
      │                      ▼
      │             ┌──────────────────┐
      │             │  Post-processor  │
      │             │  - Citations     │
      │             │  - Disclaimer    │
      │             └────────┬─────────┘
      │                      ▼
      ▼             ┌──────────────────┐
 ┌─────────┐        │   AI Response    │
 │Verified │        └────────┬─────────┘
 │Answer   │                 │
 └────┬────┘                 ▼
      │             ┌──────────────────┐
      │             │   Cache + Log    │
      │             │   to memory      │
      │             └────────┬─────────┘
      │                      ▼
      └──────────┬───────────┘
                 ▼
        ┌──────────────────┐
        │  Return to user  │
        └──────────────────┘
```

### 2.7 Multi-Region Deployment

```
┌─────────────────────────────────────────────────────────────────────┐
│                    GLOBAL EDGE (Cloudflare)                         │
└────────────┬─────────────────────────┬───────────────────┬──────────┘
             │                         │                   │
             ▼                         ▼                   ▼
    ┌─────────────────┐       ┌─────────────────┐  ┌─────────────────┐
    │   ASIA-SOUTH    │       │   ASIA-EAST     │  │   US-EAST       │
    │   (Primary)     │       │   (Secondary)   │  │   (DR)          │
    │   Nepal/India   │       │   Singapore     │  │   Virginia      │
    ├─────────────────┤       ├─────────────────┤  ├─────────────────┤
    │ - K8s Cluster   │       │ - K8s Cluster   │  │ - K8s Cluster   │
    │ - PostgreSQL    │       │ - Read Replica  │  │ - Standby       │
    │   Primary       │       │ - Read Replica  │  │   (Cold)        │
    │ - Redis Primary │       │ - Redis Replica │  │ - Logs Backup   │
    │ - Qdrant Primary│       │ - Qdrant Replica│  │                 │
    │ - Kafka Cluster │       │ - Kafka Mirror  │  │                 │
    │ - AI GPU Pool   │       │ - AI GPU Pool   │  │                 │
    └─────────────────┘       └─────────────────┘  └─────────────────┘
             │                         │                   │
             └─────────────────────────┴───────────────────┘
                                       │
                          ┌────────────▼────────────┐
                          │  S3 Cross-Region        │
                          │  Replication           │
                          │  (Data Lake)            │
                          └─────────────────────────┘
```

---

## 3. Infrastructure Requirements

### 3.1 Production Hardware Requirements

| Component | Minimum | Recommended | High Scale |
|-----------|---------|-------------|------------|
| **Application Nodes** (K8s) | 3 × 4 vCPU, 16GB RAM | 6 × 8 vCPU, 32GB RAM | 12 × 16 vCPU, 64GB RAM |
| **PostgreSQL Primary** | 4 vCPU, 16GB RAM, 100GB SSD | 8 vCPU, 32GB RAM, 500GB NVMe | 16 vCPU, 128GB RAM, 2TB NVMe |
| **PostgreSQL Replicas** (×2) | 4 vCPU, 16GB RAM | 8 vCPU, 32GB RAM | 16 vCPU, 64GB RAM |
| **Redis Cluster** (3 nodes) | 2 vCPU, 8GB RAM each | 4 vCPU, 16GB RAM each | 8 vCPU, 32GB RAM each |
| **Qdrant Cluster** (3 nodes) | 4 vCPU, 16GB RAM, 50GB SSD | 8 vCPU, 32GB RAM, 200GB NVMe | 16 vCPU, 64GB RAM, 1TB NVMe |
| **Kafka Cluster** (3 brokers) | 4 vCPU, 16GB RAM, 500GB SSD | 8 vCPU, 32GB RAM, 2TB NVMe | 16 vCPU, 64GB RAM, 8TB NVMe |
| **S3/MinIO Storage** | 500GB | 5TB | 50TB+ |
| **AI GPU Cluster** | 1 × A10G (24GB) | 2 × A100 (40GB) | 4 × A100 (80GB) |
| **Load Balancer** | 2 vCPU, 4GB RAM | 4 vCPU, 8GB RAM | 8 vCPU, 16GB RAM |
| **Monitoring Stack** | 4 vCPU, 16GB RAM | 8 vCPU, 32GB RAM | 16 vCPU, 64GB RAM |

### 3.2 Software Prerequisites

| Software | Version | Purpose |
|----------|---------|---------|
| **Kubernetes** | 1.28+ | Container orchestration |
| **Helm** | 3.13+ | Package manager |
| **Docker** | 24+ | Container runtime |
| **PostgreSQL** | 16 | Primary database |
| **Redis** | 7+ | Cache, sessions, leaderboards |
| **Qdrant** | 1.8+ | Vector database |
| **Apache Kafka** | 3.6+ | Event streaming |
| **MinIO** | RELEASE.2024+ | Object storage |
| **Kong** | 3.4+ | API Gateway |
| **Prometheus** | 2.48+ | Metrics |
| **Grafana** | 10.2+ | Visualization |
| **Jaeger** | 1.52+ | Distributed tracing |
| **ArgoCD** | 2.10+ | GitOps deployment |
| **cert-manager** | 1.13+ | SSL/TLS certificates |
| **ingress-nginx** | 1.9+ | Ingress controller |

### 3.3 Network Requirements

| Port | Protocol | Service | Source |
|------|----------|---------|--------|
| 80, 443 | TCP | HTTP/HTTPS | Public |
| 22 | TCP | SSH (Bastion) | Admin only |
| 5432 | TCP | PostgreSQL | Internal only |
| 6379 | TCP | Redis | Internal only |
| 6333-6334 | TCP | Qdrant | Internal only |
| 9092 | TCP | Kafka | Internal only |
| 9000-9001 | TCP | MinIO | Internal only |
| 3000-3011 | TCP | Microservices | Internal only |
| 8000-8001 | TCP | Kong Gateway | Edge only |
| 9090 | TCP | Prometheus | Internal only |
| 16686 | TCP | Jaeger UI | Internal only |
| 3000 | TCP | Grafana | Admin only |

---

## 4. Local Development Setup

### 4.1 Prerequisites Installation

#### Windows (PowerShell)

```powershell
# Install Chocolatey (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

# Install required tools
choco install nodejs-lts pnpm docker-desktop python311 git -y

# Install Flutter (for mobile development)
choco install flutter -y

# Verify installations
node --version     # v20+
pnpm --version     # v9+
docker --version   # 24+
python --version   # 3.11+
```

#### macOS

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install required tools
brew install node@20 pnpm docker python@3.11 git

# Install Flutter
brew install --cask flutter

# Verify installations
node --version
pnpm --version
docker --version
python3 --version
```

#### Linux (Ubuntu/Debian)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Python 3.11
sudo apt install -y python3.11 python3-pip python3-venv

# Verify installations
node --version
pnpm --version
docker --version
python3.11 --version
```

### 4.2 Quick Start (5 minutes)

```bash
# 1. Clone repository
git clone https://github.com/rhinopeaklabs-nepal/Loksewa-Ai-App.git
cd Loksewa-Ai-App

# 2. Install dependencies
pnpm install

# 3. Start infrastructure
docker compose -f infrastructure/docker/docker-compose.yml up -d

# 4. Wait for services to be ready
docker compose -f infrastructure/docker/docker-compose.yml ps
# Wait until all services show "healthy" or "running"

# 5. Run database migrations
# Windows PowerShell:
Get-ChildItem infrastructure/database/migrations/*.sql | ForEach-Object {
  $name = $_.BaseName -replace '^\d+_', ''
  $env:PGPASSWORD = 'loksewa_dev_pw'
  psql -h localhost -U loksewa -d $name -f $_.FullName
}

# macOS/Linux:
for f in infrastructure/database/migrations/*.sql; do
  dbname=$(basename "$f" .sql | sed 's/^[0-9]*_//' | tr '-' '_')
  PGPASSWORD=loksewa_dev_pw psql -h localhost -U loksewa -d "$dbname" -f "$f"
done

# 6. Build shared packages
pnpm --filter @loksewa/shared-types build
pnpm --filter @loksewa/shared-utils build

# 7. Start all services
pnpm turbo run dev --parallel
```

### 4.3 Verify Installation

| Service | URL | Credentials |
|---------|-----|-------------|
| Web App | http://localhost:3000 | (create account) |
| Admin Dashboard | http://localhost:5173 | (create account) |
| Kong Gateway | http://localhost:8000 | - |
| Grafana | http://localhost:3000 | admin / `loksewa_dev_pw` |
| Prometheus | http://localhost:9090 | - |
| Jaeger | http://localhost:16686 | - |
| MinIO Console | http://localhost:9001 | `loksewa` / `loksewa_dev_pw` |
| Qdrant | http://localhost:6333/dashboard | - |

### 4.4 Development Workflow

```bash
# Run specific service
pnpm --filter @loksewa/auth-service dev

# Run tests
pnpm test

# Run linting
pnpm lint

# Run typecheck
pnpm typecheck

# Build for production
pnpm build

# View logs
pnpm turbo run dev --parallel | grep "auth-service"
```

---

## 5. Production Deployment Options

### 5.1 Deployment Options Comparison

| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| **AWS EKS** | Managed control plane, wide service ecosystem, GPU support | Vendor lock-in, complex pricing | Large scale, global |
| **GCP GKE** | Best for AI/ML, competitive pricing, autopilot mode | Smaller ecosystem | AI-heavy workloads |
| **Azure AKS** | Microsoft integration, good for enterprises | Less mature for some services | Enterprise customers |
| **DigitalOcean K8s** | Simple, affordable, predictable pricing | Limited AI/ML services | Startups, simple needs |
| **Self-hosted (Kubespray)** | Full control, no vendor lock-in | High operational overhead | Compliance needs |
| **Railway/Render** | Zero-config, easy deploys | Limited scaling, expensive at scale | MVPs, prototypes |
| **Hetzner** | Very cheap, EU data centers | Limited services | Cost-sensitive |

### 5.2 Recommended Cloud Architecture (AWS EKS)

```
┌─────────────────────────────────────────────────────────────────┐
│                          AWS REGION                              │
│                        (ap-south-1)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    VPC (10.0.0.0/16)                      │    │
│  │                                                           │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │    │
│  │  │   Public     │  │   Private    │  │   Database   │   │    │
│  │  │   Subnets    │  │   Subnets    │  │   Subnets    │   │    │
│  │  │  10.0.0.0/24 │  │ 10.0.1.0/24  │  │ 10.0.2.0/24  │   │    │
│  │  │              │  │              │  │              │   │    │
│  │  │  - ALB       │  │  - EKS Nodes │  │  - RDS       │   │    │
│  │  │  - NAT GW    │  │  - Pods      │  │  - ElastiCache│  │    │
│  │  │  - Bastion   │  │  - Services  │  │  - Qdrant    │   │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │    │
│  │                                                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Managed Services                                          │    │
│  │  - Route 53 (DNS)                                          │    │
│  │  - CloudFront (CDN)                                        │    │
│  │  - ACM (SSL Certificates)                                 │    │
│  │  - S3 (Object Storage)                                     │    │
│  │  - EFS (Shared File System)                                │    │
│  │  - Secrets Manager                                         │    │
│  │  - KMS (Encryption Keys)                                   │    │
│  │  - CloudWatch (Monitoring)                                 │    │
│  │  - MSK (Managed Kafka)                                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Kubernetes Deployment

### 6.1 Cluster Setup

#### 6.1.1 EKS Cluster Creation

```bash
# Install eksctl
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# Create cluster
eksctl create cluster \
  --name loksewa-prod \
  --region ap-south-1 \
  --version 1.28 \
  --nodegroup-name standard-workers \
  --node-type m5.xlarge \
  --nodes 3 \
  --nodes-min 3 \
  --nodes-max 20 \
  --managed \
  --vpc-public-subnets "10.0.0.0/24,10.0.1.0/24" \
  --vpc-private-subnets "10.0.2.0/24,10.0.3.0/24" \
  --ssh-access \
  --ssh-public-key ~/.ssh/loksewa-eks.pub

# Install essential addons
helm repo add eks https://aws.github.io/eks-charts
helm repo update

# AWS Load Balancer Controller
helm install aws-load-balancer-controller eks/aws-loadbalancer-controller \
  -n kube-system --set clusterName=loksewa-prod

# cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-type"="nlb"

# Cluster autoscaler
helm install cluster-autoscaler autoscaler/cluster-autoscaler \
  --namespace kube-system \
  --set autoDiscovery.clusterName=loksewa-prod \
  --set awsRegion=ap-south-1
```

#### 6.1.2 GPU Node Group (For AI Services)

```bash
eksctl create nodegroup \
  --cluster loksewa-prod \
  --region ap-south-1 \
  --name gpu-workers \
  --node-type g5.xlarge \
  --nodes 1 \
  --nodes-min 0 \
  --nodes-max 5 \
  --node-ami-family AmazonLinux2 \
  --node-labels "role=gpu,nvidia.com/gpu=true" \
  --asg-access
```

### 6.2 Namespace Structure

```yaml
# namespaces.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: loksewa-prod
  labels:
    name: loksewa-prod
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
---
apiVersion: v1
kind: Namespace
metadata:
  name: loksewa-staging
  labels:
    name: loksewa-staging
---
apiVersion: v1
kind: Namespace
metadata:
  name: loksewa-monitoring
---
apiVersion: v1
kind: Namespace
metadata:
  name: loksewa-ai
  labels:
    name: loksewa-ai
```

### 6.3 ConfigMap for Shared Configuration

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: loksewa-config
  namespace: loksewa-prod
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
  POSTGRES_HOST: "loksewa-prod-postgres"
  REDIS_HOST: "loksewa-prod-redis"
  QDRANT_URL: "http://loksewa-prod-qdrant:6333"
  KAFKA_BROKERS: "loksewa-prod-kafka-0:9092,loksewa-prod-kafka-1:9092,loksewa-prod-kafka-2:9092"
  S3_ENDPOINT: "https://s3.amazonaws.com"
  S3_BUCKET: "loksewa-ai-prod"
  SENTRY_DSN: "https://examplePublicKey@o0.ingest.sentry.io/0"
  LLM_BASE_URL: "http://llm-service.loksewa-ai.svc.cluster.local:8000"
  EMBEDDING_MODEL: "BAAI/bge-m3"
  EMBEDDING_DIM: "1024"
```

### 6.4 Secrets Management

```yaml
# secrets.yaml (use External Secrets Operator in production)
apiVersion: v1
kind: Secret
metadata:
  name: loksewa-secrets
  namespace: loksewa-prod
type: Opaque
stringData:
  jwt-secret: "REPLACE_WITH_STRONG_RANDOM_SECRET"
  postgres-password: "REPLACE_WITH_SECURE_PASSWORD"
  redis-password: "REPLACE_WITH_SECURE_PASSWORD"
  qdrant-api-key: "REPLACE_WITH_SECURE_KEY"
  aws-access-key-id: "REPLACE_WITH_AWS_KEY"
  aws-secret-access-key: "REPLACE_WITH_AWS_SECRET"
  llm-api-key: "REPLACE_WITH_LLM_KEY"
  fcm-server-key: "REPLACE_WITH_FCM_KEY"
  sendgrid-api-key: "REPLACE_WITH_SENDGRID_KEY"
  twilio-account-sid: "REPLACE_WITH_TWILIO_SID"
  twilio-auth-token: "REPLACE_WITH_TWILIO_TOKEN"
```

### 6.5 Service Deployment Example

```yaml
# auth-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: loksewa-prod
  labels:
    app: auth-service
    tier: backend
    version: v1
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
        tier: backend
        version: v1
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9090"
        prometheus.io/path: "/metrics"
    spec:
      containers:
        - name: auth-service
          image: ghcr.io/rhinopeaklabs-nepal/loksewa-ai-auth-service:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 3001
              name: http
            - containerPort: 9090
              name: metrics
          envFrom:
            - configMapRef:
                name: loksewa-config
            - secretRef:
                name: loksewa-secrets
          env:
            - name: SERVICE_PORT
              value: "3001"
          resources:
            requests:
              memory: "256Mi"
              cpu: "200m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /healthz
              port: 3001
            initialDelaySeconds: 10
            periodSeconds: 30
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /readyz
              port: 3001
            initialDelaySeconds: 5
            periodSeconds: 10
            timeoutSeconds: 3
            failureThreshold: 2
          lifecycle:
            preStop:
              exec:
                command: ["sh", "-c", "sleep 10"]
          securityContext:
            runAsNonRoot: true
            runAsUser: 1000
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL
          volumeMounts:
            - name: tmp
              mountPath: /tmp
      volumes:
        - name: tmp
          emptyDir: {}
      securityContext:
        fsGroup: 1000
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchExpressions:
                    - key: app
                      operator: In
                      values:
                        - auth-service
                topologyKey: kubernetes.io/hostname
---
apiVersion: v1
kind: Service
metadata:
  name: auth-service
  namespace: loksewa-prod
  labels:
    app: auth-service
spec:
  type: ClusterIP
  selector:
    app: auth-service
  ports:
    - name: http
      port: 3001
      targetPort: 3001
      protocol: TCP
    - name: metrics
      port: 9090
      targetPort: 9090
      protocol: TCP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: auth-service
  namespace: loksewa-prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: auth-service
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 50
          periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 30
      policies:
        - type: Percent
          value: 100
          periodSeconds: 30
        - type: Pods
          value: 4
          periodSeconds: 30
      selectPolicy: Max
```

### 6.6 Network Policies

```yaml
# network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: loksewa-default-deny
  namespace: loksewa-prod
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-kong-to-services
  namespace: loksewa-prod
spec:
  podSelector: {}
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: kong
      ports:
        - protocol: TCP
          port: 3001
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-service-to-database
  namespace: loksewa-prod
spec:
  podSelector:
    matchLabels:
      tier: backend
  policyTypes:
    - Egress
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              name: loksewa-data
      ports:
        - protocol: TCP
          port: 5432
```

### 6.7 Ingress Configuration

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: loksewa-api
  namespace: loksewa-prod
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "300"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - api.loksewa-ai.com
        - admin.loksewa-ai.com
        - app.loksewa-ai.com
      secretName: loksewa-tls-secret
  rules:
    - host: api.loksewa-ai.com
      http:
        paths:
          - path: /v1/auth
            pathType: Prefix
            backend:
              service:
                name: auth-service
                port:
                  number: 3001
          - path: /v1/users
            pathType: Prefix
            backend:
              service:
                name: auth-service
                port:
                  number: 3001
          - path: /v1/profiles
            pathType: Prefix
            backend:
              service:
                name: user-service
                port:
                  number: 3002
          - path: /v1/missions
            pathType: Prefix
            backend:
              service:
                name: learning-service
                port:
                  number: 3003
          - path: /v1/answers
            pathType: Prefix
            backend:
              service:
                name: learning-service
                port:
                  number: 3003
          - path: /v1/progress
            pathType: Prefix
            backend:
              service:
                name: learning-service
                port:
                  number: 3003
          - path: /v1/recommendations
            pathType: Prefix
            backend:
              service:
                name: learning-service
                port:
                  number: 3003
          - path: /v1/topics
            pathType: Prefix
            backend:
              service:
                name: learning-service
                port:
                  number: 3003
          - path: /v1/lessons
            pathType: Prefix
            backend:
              service:
                name: learning-service
                port:
                  number: 3003
          - path: /v1/leaderboards
            pathType: Prefix
            backend:
              service:
                name: gamification-service
                port:
                  number: 3004
          - path: /v1/badges
            pathType: Prefix
            backend:
              service:
                name: gamification-service
                port:
                  number: 3004
          - path: /v1/users/me/xp
            pathType: Prefix
            backend:
              service:
                name: gamification-service
                port:
                  number: 3004
          - path: /v1/users/me/streak
            pathType: Prefix
            backend:
              service:
                name: gamification-service
                port:
                  number: 3004
          - path: /v1/users/me/badges
            pathType: Prefix
            backend:
              service:
                name: gamification-service
                port:
                  number: 3004
          - path: /v1/users/me/activity
            pathType: Prefix
            backend:
              service:
                name: gamification-service
                port:
                  number: 3004
          - path: /v1/questions
            pathType: Prefix
            backend:
              service:
                name: knowledge-service
                port:
                  number: 3007
          - path: /v1/search
            pathType: Prefix
            backend:
              service:
                name: knowledge-service
                port:
                  number: 3007
          - path: /v1/admin/questions
            pathType: Prefix
            backend:
              service:
                name: knowledge-service
                port:
                  number: 3007
          - path: /v1/tutor
            pathType: Prefix
            backend:
              service:
                name: ai-service
                port:
                  number: 3006
          - path: /v1/users/me/memories
            pathType: Prefix
            backend:
              service:
                name: memory-service
                port:
                  number: 3008
          - path: /v1/mock-exams
            pathType: Prefix
            backend:
              service:
                name: exam-service
                port:
                  number: 3009
    - host: app.loksewa-ai.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-app
                port:
                  number: 3000
    - host: admin.loksewa-ai.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: admin-dashboard
                port:
                  number: 5173
```

### 6.8 Persistent Storage

```yaml
# postgres-statefulset.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-data
  namespace: loksewa-prod
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: gp3
  resources:
    requests:
      storage: 500Gi
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: loksewa-prod
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:16-alpine
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_USER
              value: loksewa
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: loksewa-secrets
                  key: postgres-password
            - name: POSTGRES_DB
              value: loksewa_ai
            - name: PGDATA
              value: /var/lib/postgresql/data/pgdata
          resources:
            requests:
              memory: "16Gi"
              cpu: "4"
            limits:
              memory: "32Gi"
              cpu: "8"
          volumeMounts:
            - name: postgres-data
              mountPath: /var/lib/postgresql/data
          livenessProbe:
            exec:
              command: ["pg_isready", "-U", "loksewa"]
            initialDelaySeconds: 30
            periodSeconds: 30
          readinessProbe:
            exec:
              command: ["pg_isready", "-U", "loksewa"]
            initialDelaySeconds: 5
            periodSeconds: 10
  volumeClaimTemplates:
    - metadata:
        name: postgres-data
      spec:
        accessModes: ["ReadWriteOnce"]
        storageClassName: gp3
        resources:
          requests:
            storage: 500Gi
```

---

## 7. Cloud Provider Specific Guides

### 7.1 AWS EKS (Recommended)

#### Step 1: Prerequisites

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /

# Configure AWS
aws configure
# Enter: Access Key, Secret Key, Region (ap-south-1), Output (json)

# Install eksctl, kubectl, helm
brew install eksctl kubectl helm  # macOS
# or
choco install eksctl kubectl helm -y  # Windows
```

#### Step 2: Create EKS Cluster

```bash
# Create cluster configuration
cat > cluster.yaml << EOF
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig
metadata:
  name: loksewa-prod
  region: ap-south-1
  version: "1.28"

vpc:
  cidr: "10.0.0.0/16"
  nat:
    gateway: Single
  subnets:
    private:
      ap-south-1a: { cidr: "10.0.0.0/19" }
      ap-south-1b: { cidr: "10.0.32.0/19" }
    public:
      ap-south-1a: { cidr: "10.0.64.0/20" }
      ap-south-1b: { cidr: "10.0.80.0/20" }

managedNodeGroups:
  - name: standard-workers
    instanceType: m5.xlarge
    desiredCapacity: 3
    minSize: 3
    maxSize: 20
    volumeSize: 100
    ssh:
      allow: true
      publicKeyPath: ~/.ssh/loksewa-eks.pub

  - name: gpu-workers
    instanceType: g5.xlarge
    desiredCapacity: 1
    minSize: 0
    maxSize: 5
    labels:
      role: gpu
    taints:
      - key: nvidia.com/gpu
        value: "true"
        effect: NoSchedule
    iam:
      withAddonPolicies:
        autoScaler: true
        ebs: true

addons:
  - name: vpc-cni
    version: latest
  - name: coredns
    version: latest
  - name: kube-proxy
    version: latest
  - name: aws-ebs-csi-driver
    version: latest

iam:
  withOIDC: true
EOF

# Create cluster (takes 15-20 minutes)
eksctl create cluster -f cluster.yaml
```

#### Step 3: Install Add-ons

```bash
# Add Helm repos
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo add jetstack https://charts.jetstack.io
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Install ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-type"="nlb" \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-scheme"="internet-facing"

# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create Let's Encrypt issuer
cat > cluster-issuer.yaml << EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@loksewa-ai.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: nginx
EOF
kubectl apply -f cluster-issuer.yaml

# Install metrics-server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Install Prometheus + Grafana
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace loksewa-monitoring --create-namespace \
  --set grafana.adminPassword="YOUR_SECURE_PASSWORD" \
  --set prometheus.prometheusSpec.retention=30d \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=50Gi
```

#### Step 4: Deploy Managed Services

```bash
# Create RDS PostgreSQL
aws rds create-db-instance \
  --db-instance-identifier loksewa-prod-db \
  --db-instance-class db.r6g.2xlarge \
  --engine postgres \
  --engine-version 16.1 \
  --master-username loksewa \
  --master-user-password "YOUR_SECURE_PASSWORD" \
  --allocated-storage 500 \
  --storage-type gp3 \
  --storage-encrypted \
  --multi-az \
  --db-subnet-group-name loksewa-db-subnet \
  --vpc-security-group-ids sg-xxxxxxxx \
  --backup-retention-period 30 \
  --performance-insights-enabled \
  --deletion-protection

# Create ElastiCache Redis cluster
aws elasticache create-replication-group \
  --replication-group-id loksewa-prod-redis \
  --replication-group-description "Loksewa AI Redis" \
  --engine redis \
  --engine-version 7.0 \
  --cache-node-type cache.r6g.xlarge \
  --num-cache-clusters 3 \
  --automatic-failover-enabled \
  --multi-az-enabled \
  --transit-encryption-enabled \
  --auth-token "YOUR_REDIS_PASSWORD"

# Create MSK Kafka cluster
aws kafka create-cluster \
  --cluster-name "loksewa-prod-kafka" \
  --broker-node-group-info file://kafka-config.json \
  --kafka-version "3.6.0" \
  --number-of-broker-nodes 3 \
  --encryption-info file://encryption-config.json
```

#### Step 5: Deploy Application

```bash
# Clone repository
git clone https://github.com/rhinopeaklabs-nepal/Loksewa-Ai-App.git
cd Loksewa-Ai-App

# Create namespace
kubectl create namespace loksewa-prod

# Apply secrets (use External Secrets Operator in real production)
kubectl apply -f infrastructure/kubernetes/secrets.yaml

# Apply ConfigMap
kubectl apply -f infrastructure/kubernetes/configmap.yaml

# Deploy all services
kubectl apply -f infrastructure/kubernetes/

# Wait for deployments
kubectl wait --for=condition=available --timeout=300s deployment --all -n loksewa-prod

# Check status
kubectl get pods -n loksewa-prod
kubectl get services -n loksewa-prod
kubectl get ingress -n loksewa-prod
```

### 7.2 GCP GKE (Alternative)

```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
gcloud init

# Enable required APIs
gcloud services enable container.googleapis.com \
  compute.googleapis.com \
  sqladmin.googleapis.com \
  redis.googleapis.com

# Create GKE cluster
gcloud container clusters create loksewa-prod \
  --region asia-south1 \
  --num-nodes 1 \
  --machine-type e2-standard-4 \
  --enable-autoscaling \
  --min-nodes 1 \
  --max-nodes 20 \
  --enable-autorepair \
  --enable-autoupgrade \
  --network "projects/PROJECT_ID/global/networks/loksewa-vpc" \
  --subnetwork "projects/PROJECT_ID/regions/asia-south1/subnetworks/loksewa-subnet" \
  --enable-ip-alias \
  --enable-stackdriver-kubernetes-engine-monitoring \
  --release-channel regular

# Create node pool for AI
gcloud container node-pools create ai-pool \
  --cluster loksewa-prod \
  --region asia-south1 \
  --machine-type n1-standard-8 \
  --accelerator type=nvidia-tesla-t4,count=1 \
  --num-nodes 1 \
  --enable-autoscaling \
  --min-nodes 0 \
  --max-nodes 5

# Get credentials
gcloud container clusters get-credentials loksewa-prod --region asia-south1
```

### 7.3 DigitalOcean Kubernetes (Budget Option)

```bash
# Install doctl
brew install doctl  # macOS
# or
choco install doctl -y  # Windows

# Authenticate
doctl auth init

# Create cluster
doctl kubernetes cluster create loksewa-prod \
  --region blr1 \
  --version 1.28.2-do.0 \
  --node-pool "name=worker-pool;size=s-4vcpu-16gb;count=3;autoscale-min=3;autoscale-max=20" \
  --addons ingress

# Get credentials
doctl kubernetes cluster get-default-kubeconfig loksewa-prod | kubectl apply -f -

# Install nginx ingress
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.0/deploy/static/provider/do/deploy.yaml
```

---

## 8. CI/CD Pipeline

### 8.1 GitHub Actions Workflow

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]
    paths-ignore:
      - "docs/**"
      - "*.md"
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_PREFIX: ghcr.io/rhinopeaklabs-nepal

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [auth-service, user-service, learning-service, gamification-service, 
                  knowledge-service, ai-service, memory-service, exam-service,
                  analytics-service, notification-service, content-service]
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build shared packages
        run: |
          pnpm --filter @loksewa/shared-types build
          pnpm --filter @loksewa/shared-utils build
      
      - name: Run tests
        run: pnpm --filter @loksewa/${{ matrix.service }} test
      
      - name: Run typecheck
        run: pnpm --filter @loksewa/${{ matrix.service }} typecheck
      
      - name: Run lint
        run: pnpm --filter @loksewa/${{ matrix.service }} lint

  build:
    name: Build & Push Images
    needs: test
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [auth-service, user-service, learning-service, gamification-service,
                  knowledge-service, ai-service, memory-service, exam-service,
                  analytics-service, notification-service, content-service]
    steps:
      - uses: actions/checkout@v4
      
      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.IMAGE_PREFIX }}/loksewa-ai-${{ matrix.service }}
          tags: |
            type=sha,prefix=
            type=ref,event=branch
            type=raw,value=latest,enable={{is_default_branch}}
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./services/${{ matrix.service }}
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    name: Deploy to Staging
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure kubectl
        uses: azure/k8s-set-context@v3
        with:
          method: kubeconfig
          kubeconfig: ${{ secrets.KUBECONFIG_STAGING }}
      
      - name: Deploy to Staging
        run: |
          envsubst < infrastructure/kubernetes/deployment.yaml | kubectl apply -f -
          kubectl rollout status deployment --timeout=300s -n loksewa-staging
      
      - name: Run smoke tests
        run: |
          sleep 30
          ./scripts/smoke-test.sh https://staging.loksewa-ai.com

  deploy-production:
    name: Deploy to Production
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure kubectl
        uses: azure/k8s-set-context@v3
        with:
          method: kubeconfig
          kubeconfig: ${{ secrets.KUBECONFIG_PROD }}
      
      - name: Deploy to Production (Canary 10%)
        run: |
          envsubst < infrastructure/kubernetes/deployment-canary.yaml | kubectl apply -f -
          kubectl rollout status deployment --timeout=600s -n loksewa-prod
          ./scripts/canary-test.sh
      
      - name: Promote to Full
        run: |
          envsubst < infrastructure/kubernetes/deployment.yaml | kubectl apply -f -
          kubectl rollout status deployment --timeout=600s -n loksewa-prod
          kubectl delete -f infrastructure/kubernetes/deployment-canary.yaml -n loksewa-prod --ignore-not-found
      
      - name: Notify Slack
        if: success()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "✅ Loksewa AI deployed to production: ${{ github.sha }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### 8.2 ArgoCD Application

```yaml
# argocd-app.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: loksewa-ai-prod
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/rhinopeaklabs-nepal/Loksewa-Ai-App.git
    targetRevision: HEAD
    path: infrastructure/kubernetes/overlays/production
  destination:
    server: https://kubernetes.default.svc
    namespace: loksewa-prod
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
    syncOptions:
      - CreateNamespace=true
      - PrunePropagationPolicy=foreground
      - PruneLast=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
  revisionHistoryLimit: 10
```

---

## 9. Monitoring & Observability

### 9.1 Prometheus Configuration

```yaml
# prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: loksewa-monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
      external_labels:
        cluster: loksewa-prod
        region: ap-south-1

    rule_files:
      - /etc/prometheus/rules/*.yml

    alerting:
      alertmanagers:
        - static_configs:
            - targets: ['alertmanager:9093']

    scrape_configs:
      - job_name: 'kubernetes-pods'
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
            action: keep
            regex: true
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
            action: replace
            target_label: __metrics_path__
            regex: (.+)
          - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
            action: replace
            regex: ([^:]+)(?::\d+)?;(\d+)
            replacement: $1:$2
            target_label: __address__
          - source_labels: [__meta_kubernetes_namespace]
            action: replace
            target_label: namespace
          - source_labels: [__meta_kubernetes_pod_name]
            action: replace
            target_label: pod

      - job_name: 'postgres'
        static_configs:
          - targets: ['postgres-exporter:9187']

      - job_name: 'redis'
        static_configs:
          - targets: ['redis-exporter:9121']

      - job_name: 'kafka'
        static_configs:
          - targets: ['kafka-exporter:9308']

      - job_name: 'qdrant'
        static_configs:
          - targets: ['qdrant-exporter:9100']
```

### 9.2 Grafana Dashboards

#### Key Dashboards to Create

**1. Application Overview**
- Request rate per service
- Error rate (4xx, 5xx)
- P50, P95, P99 latency
- Active users
- Service health status

**2. Database Performance**
- PostgreSQL connections
- Query latency
- Replication lag
- Cache hit ratio
- Slow queries

**3. AI Service Metrics**
- LLM token usage
- Embedding requests
- RAG retrieval latency
- Cost per request
- User satisfaction (👍/👎)

**4. Business Metrics**
- DAU/WAU/MAU
- Streak distribution
- Question answer accuracy
- Mock exam pass rate
- Mission completion rate
- Leaderboard activity

### 9.3 Alerting Rules

```yaml
# alerts.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: loksewa-alerts
  namespace: loksewa-monitoring
spec:
  groups:
    - name: loksewa.critical
      interval: 30s
      rules:
        - alert: ServiceDown
          expr: up{job="kubernetes-pods"} == 0
          for: 2m
          labels:
            severity: critical
          annotations:
            summary: "Service {{ $labels.pod }} is down"
            description: "Pod {{ $labels.pod }} in {{ $labels.namespace }} has been down for more than 2 minutes."
        
        - alert: HighErrorRate
          expr: |
            sum(rate(http_requests_total{status=~"5.."}[5m])) by (service)
            / sum(rate(http_requests_total[5m])) by (service) > 0.05
          for: 5m
          labels:
            severity: critical
          annotations:
            summary: "High error rate on {{ $labels.service }}"
            description: "Error rate is {{ $value | humanizePercentage }} (> 5%)"
        
        - alert: HighLatency
          expr: |
            histogram_quantile(0.95, 
              sum(rate(http_request_duration_seconds_bucket[5m])) by (service, le)
            ) > 1
          for: 10m
          labels:
            severity: warning
          annotations:
            summary: "High P95 latency on {{ $labels.service }}"
            description: "P95 latency is {{ $value }}s (> 1s)"
        
        - alert: DatabaseConnectionsHigh
          expr: pg_stat_activity_count > 80
          for: 5m
          labels:
            severity: warning
          annotations:
            summary: "PostgreSQL connections high"
            description: "{{ $value }} active connections (limit: 100)"
        
        - alert: DiskSpaceLow
          expr: |
            (node_filesystem_avail_bytes{mountpoint="/"}
            / node_filesystem_size_bytes{mountpoint="/"}) < 0.1
          for: 10m
          labels:
            severity: critical
          annotations:
            summary: "Disk space low on {{ $labels.instance }}"
        
        - alert: LLMHighCost
          expr: rate(llm_cost_dollars_total[1h]) > 50
          for: 30m
          labels:
            severity: warning
          annotations:
            summary: "LLM costs exceeding $50/hour"
            description: "Current rate: ${{ $value }}/hour"
        
        - alert: KafkaLag
          expr: kafka_consumergroup_lag > 10000
          for: 10m
          labels:
            severity: warning
          annotations:
            summary: "Kafka consumer lag high"
```

### 9.4 Logging with Loki

```yaml
# loki-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: loki-config
  namespace: loksewa-monitoring
data:
  loki.yaml: |
    auth_enabled: false
    
    server:
      http_listen_port: 3100
    
    common:
      path_prefix: /loki
      storage:
        filesystem:
          chunks_directory: /loki/chunks
          rules_directory: /loki/rules
      replication_factor: 1
      ring:
        kvstore:
          store: inmemory
    
    schema_config:
      configs:
        - from: 2024-01-01
          store: tsdb
          object_store: filesystem
          schema: v13
          index:
            prefix: index_
            period: 24h
    
    limits_config:
      retention_period: 30d
      ingestion_rate_mb: 50
      ingestion_burst_size_mb: 100
    
    ruler:
      alertmanager_url: http://alertmanager:9093
```

### 9.5 Distributed Tracing

```yaml
# otel-collector.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: otel-collector-config
  namespace: loksewa-monitoring
data:
  otel-collector-config.yaml: |
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318
    
    processors:
      batch:
        timeout: 10s
        send_batch_size: 1024
      memory_limiter:
        check_interval: 1s
        limit_percentage: 80
        spike_limit_percentage: 25
      resource:
        attributes:
          - key: cluster.name
            value: loksewa-prod
            action: insert
    
    exporters:
      jaeger:
        endpoint: jaeger:14250
        tls:
          insecure: true
      prometheus:
        endpoint: 0.0.0.0:8889
    
    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [memory_limiter, batch, resource]
          exporters: [jaeger]
        metrics:
          receivers: [otlp]
          processors: [memory_limiter, batch, resource]
          exporters: [prometheus]
```

---

## 10. Scaling Strategy

### 10.1 Horizontal Pod Autoscaler Configuration

```yaml
# hpa-ai-service.yaml (LLM-heavy workload)
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ai-service
  namespace: loksewa-prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ai-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Pods
      pods:
        metric:
          name: http_requests_per_second
        target:
          type: AverageValue
          averageValue: "50"
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 60
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 600
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 30
      policies:
        - type: Percent
          value: 100
          periodSeconds: 30
        - type: Pods
          value: 2
          periodSeconds: 30
```

### 10.2 Database Scaling Strategy

```
┌──────────────────────────────────────────────────────────────┐
│                   POSTGRESQL SCALING                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Phase 1: Vertical Scaling (Single Primary + Replicas)       │
│  - db.r6g.large → db.r6g.xlarge → db.r6g.2xlarge           │
│  - Add read replicas: 1 → 2 → 4                              │
│  - Storage: gp3 with autoscaling                             │
│                                                               │
│  Phase 2: Connection Pooling (PgBouncer)                      │
│  - Reduce connection count by 80%                            │
│  - Transaction pooling mode                                   │
│                                                               │
│  Phase 3: Partitioning                                        │
│  - Partition large tables by date/tenant                      │
│  - Archive old data to S3                                     │
│                                                               │
│  Phase 4: Sharding (if needed)                               │
│  - Shard by user_id or region                                 │
│  - Use Citus for distributed PostgreSQL                       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 10.3 Redis Scaling

```yaml
# redis-cluster.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: redis-cluster-config
data:
  redis.conf: |
    cluster-enabled yes
    cluster-config-file nodes.conf
    cluster-node-timeout 5000
    appendonly yes
    maxmemory 8gb
    maxmemory-policy allkeys-lru
    
    # Replication
    replica-serve-stale-data yes
    replica-read-only yes
    
    # Performance
    tcp-keepalive 60
    timeout 300
    
    # Persistence
    save 900 1
    save 300 10
    save 60 10000
```

### 10.4 Qdrant Sharding

```yaml
# qdrant-shard.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: qdrant-config
data:
  config.yaml: |
    service:
      host: 0.0.0.0
      http_port: 6333
      grpc_port: 6334
    
    storage:
      storage_path: /qdrant/storage
      snapshots_path: /qdrant/snapshots
      enable_journal: true
      
    cluster:
      enabled: true
      p2p:
        port: 6335
      consensus:
        tick_period_ms: 100
      
    # Collection defaults
    collections:
      knowledge_chunks:
        vectors:
          size: 1024
          distance: Cosine
        shard_number: 3
        replication_factor: 2
        write_consistency_factor: 1
      
      user_memories:
        vectors:
          size: 384
          distance: Cosine
        shard_number: 6
        replication_factor: 2
        write_consistency_factor: 1
```

### 10.5 AI GPU Scaling

```yaml
# llm-service-with-gpu.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: llm-service
  namespace: loksewa-ai
spec:
  replicas: 1
  selector:
    matchLabels:
      app: llm-service
  template:
    metadata:
      labels:
        app: llm-service
    spec:
      nodeSelector:
        nvidia.com/gpu: "true"
      tolerations:
        - key: nvidia.com/gpu
          operator: Exists
          effect: NoSchedule
      containers:
        - name: vllm
          image: vllm/vllm-openai:latest
          args:
            - "--model"
            - "Qwen/Qwen2.5-14B-Instruct"
            - "--tensor-parallel-size"
            - "1"
            - "--gpu-memory-utilization"
            - "0.90"
            - "--max-model-len"
            - "4096"
            - "--enable-prefix-caching"
          ports:
            - containerPort: 8000
          resources:
            limits:
              nvidia.com/gpu: 1
              memory: 24Gi
              cpu: 8
          volumeMounts:
            - name: model-cache
              mountPath: /root/.cache/huggingface
      volumes:
        - name: model-cache
          persistentVolumeClaim:
            claimName: model-cache-pvc
```

---

## 11. Security Hardening

### 11.1 Security Checklist

```
✅ Network Policies (default deny + explicit allows)
✅ Pod Security Standards (restricted)
✅ RBAC with least privilege
✅ Service Mesh (mTLS between services)
✅ Secrets encryption at rest (etcd encryption, KMS)
✅ Image scanning (Trivy, Snyk)
✅ Admission controllers (OPA Gatekeeper, Kyverno)
✅ Runtime security (Falco)
✅ WAF (Cloudflare, AWS WAF)
✅ DDoS protection
✅ SSL/TLS everywhere
✅ Rate limiting (Kong)
✅ Audit logging
✅ Vulnerability scanning
✅ Compliance: GDPR, ISO 27001, SOC 2
```

### 11.2 Pod Security Standards

```yaml
# pss-restricted.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: loksewa-prod
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/enforce-version: latest
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

### 11.3 Network Policies (Zero Trust)

```yaml
# zero-trust-network.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: loksewa-prod
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
---
# Allow DNS
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dns
  namespace: loksewa-prod
spec:
  podSelector: {}
  policyTypes:
    - Egress
  egress:
    - to:
        - namespaceSelector: {}
          podSelector:
            matchLabels:
              k8s-app: kube-dns
      ports:
        - protocol: UDP
          port: 53
---
# Allow Kong to services
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-kong-ingress
  namespace: loksewa-prod
spec:
  podSelector: {}
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: kong
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
---
# Allow services to databases
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-db-egress
  namespace: loksewa-prod
spec:
  podSelector:
    matchLabels:
      tier: backend
  policyTypes:
    - Egress
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              name: loksewa-data
      ports:
        - protocol: TCP
          port: 5432  # PostgreSQL
        - protocol: TCP
          port: 6379  # Redis
        - protocol: TCP
          port: 6333  # Qdrant
        - protocol: TCP
          port: 9092  # Kafka
```

### 11.4 RBAC Configuration

```yaml
# rbac.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: loksewa-backend
  namespace: loksewa-prod
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: loksewa-backend-role
  namespace: loksewa-prod
rules:
  - apiGroups: [""]
    resources: ["configmaps", "secrets"]
    verbs: ["get", "list"]
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: loksewa-backend-binding
  namespace: loksewa-prod
subjects:
  - kind: ServiceAccount
    name: loksewa-backend
    namespace: loksewa-prod
roleRef:
  kind: Role
  name: loksewa-backend-role
  apiGroup: rbac.authorization.k8s.io
```

### 11.5 Secrets Encryption (External Secrets Operator)

```yaml
# external-secrets.yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secrets-manager
  namespace: loksewa-prod
spec:
  provider:
    aws:
      service: SecretsManager
      region: ap-south-1
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets-sa
---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: loksewa-secrets
  namespace: loksewa-prod
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: loksewa-secrets
    creationPolicy: Owner
  data:
    - secretKey: postgres-password
      remoteRef:
        key: loksewa/prod/postgres
        property: password
    - secretKey: jwt-secret
      remoteRef:
        key: loksewa/prod/jwt
        property: secret
    - secretKey: llm-api-key
      remoteRef:
        key: loksewa/prod/llm
        property: api_key
```

### 11.6 SSL/TLS Configuration

```yaml
# cert-manager-issuer.yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@loksewa-ai.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: nginx
      - dns01:
          route53:
            region: ap-south-1
            accessKeyID: AKIAXXXXXXXXXXXXXXXX
            secretAccessKeySecretRef:
              name: aws-credentials
              key: secret-access-key
```

---

## 12. Backup & Disaster Recovery

### 12.1 Backup Strategy

```yaml
# velero-backup.yaml
apiVersion: velero.io/v1
kind: Schedule
metadata:
  name: loksewa-daily-backup
  namespace: velero
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  template:
    includedNamespaces:
      - loksewa-prod
    excludedResources:
      - events
      - pods
    storageLocation: default
    volumeSnapshotLocations:
      - default
    ttl: 720h  # 30 days retention
    options:
      - --default-volumes-to-restic
---
apiVersion: velero.io/v1
kind: Schedule
metadata:
  name: loksewa-weekly-backup
  namespace: velero
spec:
  schedule: "0 3 * * 0"  # Weekly on Sunday at 3 AM
  template:
    includedNamespaces:
      - loksewa-prod
    storageLocation: long-term
    ttl: 2160h  # 90 days retention
```

### 12.2 Database Backup Script

```bash
#!/bin/bash
# backup-database.sh
set -e

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
S3_BUCKET="loksewa-ai-backups"
RETENTION_DAYS=30

# Create backup
echo "Starting PostgreSQL backup..."
pg_dump -h $POSTGRES_HOST -U loksewa \
  -Fc \
  --no-owner \
  --no-acl \
  --jobs=4 \
  -d loksewa_ai \
  | gzip > $BACKUP_DIR/full_backup_$TIMESTAMP.sql.gz

# Upload to S3
echo "Uploading to S3..."
aws s3 cp $BACKUP_DIR/full_backup_$TIMESTAMP.sql.gz \
  s3://$S3_BUCKET/database/full/ \
  --storage-class STANDARD_IA

# Cleanup old backups
echo "Cleaning up old backups..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

aws s3api list-objects-v2 \
  --bucket $S3_BUCKET \
  --prefix database/full/ \
  --query "Contents[?LastModified<='$(date -d "$RETENTION_DAYS days ago" --iso-8601)'].Key" \
  --output text | xargs -I {} aws s3 rm s3://$S3_BUCKET/{}

echo "Backup completed: $BACKUP_DIR/full_backup_$TIMESTAMP.sql.gz"
```

### 12.3 Disaster Recovery Plan

```
┌──────────────────────────────────────────────────────────────┐
│              DISASTER RECOVERY TIERS                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  RTO (Recovery Time Objective) & RPO (Recovery Point Objective)│
│                                                               │
│  Tier 0: Critical (auth, ai-service)                         │
│    RTO: 5 minutes  |  RPO: 0 (synchronous replication)       │
│    Strategy: Active-Active multi-region                       │
│                                                               │
│  Tier 1: Important (learning, gamification)                  │
│    RTO: 30 minutes |  RPO: 1 minute                          │
│    Strategy: Active-Passive with automated failover           │
│                                                               │
│  Tier 2: Standard (analytics, notifications)                 │
│    RTO: 4 hours    |  RPO: 1 hour                            │
│    Strategy: Daily backups, manual restore                    │
│                                                               │
│  Tier 3: Archive (logs, old data)                            │
│    RTO: 24 hours   |  RPO: 24 hours                          │
│    Strategy: S3 Glacier backups                               │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 12.4 Failover Runbook

```bash
#!/bin/bash
# failover-to-secondary.sh
set -e

echo "=== FAILOVER TO SECONDARY REGION ==="

# 1. Verify secondary region is healthy
echo "Checking secondary region health..."
aws eks describe-cluster --name loksewa-prod-secondary --region ap-southeast-1
kubectl --context=secondary get nodes

# 2. Promote RDS read replica
echo "Promoting RDS read replica..."
aws rds promote-read-replica \
  --db-instance-identifier loksewa-prod-db-replica \
  --region ap-southeast-1

# 3. Update Route 53 DNS
echo "Updating DNS records..."
aws route53 change-resource-record-sets \
  --hosted-zone-id ZXXXXXXXXXXXXX \
  --change-batch file://dns-failover.json

# 4. Scale up secondary services
echo "Scaling up secondary cluster..."
kubectl --context=secondary scale deployment --all --replicas=3 -n loksewa-prod

# 5. Verify services
echo "Verifying services..."
./scripts/verify-deployment.sh https://api.loksewa-ai.com

# 6. Notify team
echo "Notifying team..."
./scripts/send-alert.sh "Production failover to ap-southeast-1 completed"

echo "=== FAILOVER COMPLETE ==="
```

---

## 13. Cost Optimization

### 13.1 Cost Estimation (Monthly, ap-south-1)

| Service | Configuration | Monthly Cost (USD) |
|---------|---------------|---------------------|
| **EKS Cluster** | 1 cluster, 3 m5.xlarge nodes | $400 |
| **GPU Nodes** | 1 × g5.xlarge (on-demand) | $700 |
| **RDS PostgreSQL** | db.r6g.2xlarge Multi-AZ | $1,200 |
| **ElastiCache Redis** | 3 × cache.r6g.large | $450 |
| **MSK Kafka** | 3 × kafka.m5.large | $600 |
| **Application Load Balancer** | 1 ALB + 50 GB processed | $50 |
| **NAT Gateway** | 2 × NAT + 100 GB data | $100 |
| **S3 Storage** | 5 TB Standard + 10 TB IA | $200 |
| **CloudFront** | 1 TB transfer | $100 |
| **Data Transfer** | Inter-AZ + Internet | $300 |
| **CloudWatch** | Metrics + Logs + Alarms | $200 |
| **Secrets Manager** | 100 secrets | $50 |
| **Backup Storage** | 1 TB in S3 Glacier | $15 |
| **External Services** | LLM API, SendGrid, Twilio | $2,000 |
| **Misc (Route53, KMS, etc.)** | - | $100 |
| **TOTAL** | | **~$6,465/month** |

### 13.2 Cost Optimization Strategies

```
┌──────────────────────────────────────────────────────────────┐
│                  COST OPTIMIZATION CHECKLIST                  │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  COMPUTE:                                                    │
│  ✅ Use Spot Instances for non-critical workloads (60-90% off)│
│  ✅ Right-size containers with VPA recommendations          │
│  ✅ Schedule dev/staging to shut down nights/weekends        │
│  ✅ Use Karpenter for just-in-time node provisioning         │
│                                                               │
│  DATABASE:                                                    │
│  ✅ Use Aurora Serverless v2 for variable workloads          │
│  ✅ Enable storage auto-scaling                              │
│  ✅ Use read replicas for read-heavy services                │
│  ✅ Archive old data to S3 Glacier                          │
│                                                               │
│  AI/LLM:                                                      │
│  ✅ Cache frequent queries (Redis)                           │
│  ✅ Use smaller models when possible (7B vs 72B)             │
│  ✅ Implement request batching                               │
│  ✅ Set max_tokens to control costs                          │
│  ✅ Use spot GPUs for training                               │
│                                                               │
│  STORAGE:                                                     │
│  ✅ S3 Intelligent Tiering                                   │
│  ✅ Lifecycle policies (Standard → IA → Glacier)              │
│  ✅ Delete old logs/metrics                                  │
│  ✅ Compress backups                                         │
│                                                               │
│  NETWORK:                                                    │
│  ✅ Use VPC endpoints (avoid NAT costs)                      │
│  ✅ CloudFront caching                                       │
│  ✅ Compress API responses                                   │
│  ✅ Keep traffic in same region                              │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 13.3 Karpenter for Auto-scaling

```yaml
# karpenter-nodeclass.yaml
apiVersion: karpenter.k8s.aws/v1beta1
kind: EC2NodeClass
metadata:
  name: default
spec:
  amiFamily: AL2
  role: "KarpenterNodeRole-loksewa-prod"
  subnetSelectorTerms:
    - tags:
        karpenter.sh/discovery: loksewa-prod
  securityGroupSelectorTerms:
    - tags:
        karpenter.sh/discovery: loksewa-prod
  blockDeviceMappings:
    - deviceName: /dev/xvda
      ebs:
        volumeSize: 100Gi
        volumeType: gp3
        deleteOnTermination: true
---
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: default
spec:
  template:
    spec:
      requirements:
        - key: kubernetes.io/arch
          operator: In
          values: ["amd64"]
        - key: karpenter.sh/capacity-type
          operator: In
          values: ["spot", "on-demand"]
        - key: karpenter.k8s.aws/instance-category
          operator: In
          values: ["c", "m", "r"]
        - key: karpenter.k8s.aws/instance-generation
          operator: Gt
          values: ["4"]
      nodeClassRef:
        apiVersion: karpenter.k8s.aws/v1beta1
        kind: EC2NodeClass
        name: default
  limits:
    cpu: "100"
    memory: 400Gi
  disruption:
    consolidationPolicy: WhenUnderutilized
    expireAfter: 720h
```

---

## 14. Troubleshooting

### 14.1 Common Issues and Solutions

#### Issue: Pod stuck in Pending

```bash
# Check why pod is not scheduled
kubectl describe pod <pod-name> -n loksewa-prod

# Common reasons:
# 1. Insufficient resources
kubectl describe nodes | grep -A 5 "Allocated resources"

# 2. No matching node selector
# Check node labels
kubectl get nodes --show-labels

# 3. PVC not bound
kubectl get pvc -n loksewa-prod

# Solution: Add more nodes or adjust resource requests
```

#### Issue: Database connection errors

```bash
# Check database connectivity
kubectl run -it --rm debug --image=postgres:16 --restart=Never -- \
  psql -h postgres.loksewa-prod.svc.cluster.local -U loksewa -d loksewa_ai

# Check connection pool
kubectl exec -it <postgres-pod> -n loksewa-prod -- \
  psql -U loksewa -c "SELECT count(*) FROM pg_stat_activity;"

# Check for long-running queries
kubectl exec -it <postgres-pod> -n loksewa-prod -- \
  psql -U loksewa -c "SELECT pid, query, state FROM pg_stat_activity WHERE state != 'idle';"
```

#### Issue: High latency in AI service

```bash
# Check LLM service status
kubectl logs -n loksewa-ai -l app=llm-service --tail=100

# Check GPU utilization
kubectl exec -it <llm-pod> -n loksewa-ai -- nvidia-smi

# Check request queue
curl http://llm-service.loksewa-ai.svc.cluster.local:8000/metrics

# Solutions:
# 1. Scale up GPU nodes
kubectl scale deployment llm-service -n loksewa-ai --replicas=3

# 2. Enable prefix caching
# 3. Use smaller model for simple queries
# 4. Increase timeout in service
```

#### Issue: Kafka consumer lag

```bash
# Check consumer lag
kubectl exec -it <kafka-pod> -n loksewa-prod -- \
  kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --describe --group analytics-service-aggregator

# Solutions:
# 1. Increase consumer instances
kubectl scale deployment analytics-service --replicas=5 -n loksewa-prod

# 2. Increase partition count
# 3. Optimize consumer code
# 4. Check for processing errors
kubectl logs -l app=analytics-service -n loksewa-prod --tail=200 | grep ERROR
```

#### Issue: Out of memory

```bash
# Check memory usage
kubectl top pods -n loksewa-prod --sort-by=memory

# Check OOMKilled events
kubectl get events -n loksewa-prod | grep OOMKilled

# Solutions:
# 1. Increase memory limits
kubectl set resources deployment <name> -n loksewa-prod \
  --limits=memory=1Gi --requests=memory=512Mi

# 2. Optimize application memory usage
# 3. Add more nodes
```

### 14.2 Diagnostic Commands

```bash
# Cluster overview
kubectl get nodes
kubectl get pods -A
kubectl get services -A
kubectl get ingress -A

# Resource usage
kubectl top nodes
kubectl top pods -A
kubectl describe node <node-name>

# Logs
kubectl logs -f <pod-name> -n <namespace> --tail=100
kubectl logs -f <pod-name> -n <namespace> --previous  # Previous instance

# Events
kubectl get events -n <namespace> --sort-by='.lastTimestamp'

# Debug pod
kubectl run -it --rm debug --image=nicolaka/netshoot --restart=Never -- /bin/bash

# Port forward for local testing
kubectl port-forward -n loksewa-prod svc/auth-service 3001:3001

# Exec into container
kubectl exec -it <pod-name> -n <namespace> -- /bin/sh

# Check secrets
kubectl get secret loksewa-secrets -n loksewa-prod -o yaml

# Check ConfigMap
kubectl get configmap loksewa-config -n loksewa-prod -o yaml

# Check PVC
kubectl get pvc -A
kubectl describe pvc <pvc-name> -n <namespace>

# Check network policies
kubectl get networkpolicies -A
kubectl describe networkpolicy <name> -n <namespace>
```

### 14.3 Performance Tuning

```yaml
# Node tuning for database workloads
apiVersion: v1
kind: ConfigMap
metadata:
  name: node-performance-config
data:
  sysctl.conf: |
    # Kernel parameters for high-performance database
    vm.swappiness = 1
    vm.dirty_ratio = 15
    vm.dirty_background_ratio = 5
    vm.vfs_cache_pressure = 50
    
    # Network optimization
    net.core.somaxconn = 65535
    net.core.netdev_max_backlog = 65536
    net.ipv4.tcp_max_syn_backlog = 65536
    net.ipv4.tcp_tw_reuse = 1
    net.ipv4.tcp_fin_timeout = 15
    net.ipv4.tcp_keepalive_time = 300
    net.ipv4.tcp_keepalive_intvl = 60
    net.ipv4.tcp_keepalive_probes = 5
    
    # File system
    fs.file-max = 2097152
    fs.nr_open = 1048576
    
    # Shared memory
    kernel.shmmax = 17179869184
    kernel.shmall = 4194304
```

---

## Appendix A: Quick Reference

### Service Port Reference

| Service | Internal Port | External Access |
|---------|--------------|-----------------|
| auth-service | 3001 | Kong: /v1/auth, /v1/users |
| user-service | 3002 | Kong: /v1/profiles |
| learning-service | 3003 | Kong: /v1/missions, /v1/answers, etc. |
| gamification-service | 3004 | Kong: /v1/leaderboards, /v1/badges |
| knowledge-service | 3007 | Kong: /v1/questions, /v1/search |
| ai-service | 3006 | Kong: /v1/tutor |
| memory-service | 3008 | Kong: /v1/users/me/memories |
| exam-service | 3009 | Kong: /v1/mock-exams |
| analytics-service | 3011 | Internal only |
| notification-service | 3010 | Internal only |
| content-service | 3011 | Internal only |

### Environment Variables

```bash
# Database
POSTGRES_HOST=postgres.loksewa-prod.svc.cluster.local
POSTGRES_PORT=5432
POSTGRES_DB=loksewa_ai
POSTGRES_USER=loksewa
POSTGRES_PASSWORD=<from-secret>

# Cache
REDIS_HOST=redis.loksewa-prod.svc.cluster.local
REDIS_PORT=6379
REDIS_PASSWORD=<from-secret>

# Vector DB
QDRANT_URL=http://qdrant.loksewa-prod.svc.cluster.local:6333
QDRANT_API_KEY=<from-secret>

# Kafka
KAFKA_BROKERS=kafka.loksewa-prod.svc.cluster.local:9092

# Object Storage
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET=loksewa-ai-prod
S3_ACCESS_KEY=<from-secret>
S3_SECRET_KEY=<from-secret>

# AI
LLM_BASE_URL=http://llm-service.loksewa-ai.svc.cluster.local:8000
LLM_API_KEY=<from-secret>
EMBEDDING_MODEL=BAAI/bge-m3
EMBEDDING_DIM=1024

# Service ports
SERVICE_PORT=<auto>
NODE_ENV=production
LOG_LEVEL=info

# Monitoring
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector.loksewa-monitoring:4317
SENTRY_DSN=<from-secret>
```

### Useful Aliases

```bash
# Add to ~/.bashrc or ~/.zshrc
alias k='kubectl'
alias kprod='kubectl -n loksewa-prod'
alias kstage='kubectl -n loksewa-staging'
alias kdev='kubectl -n loksewa-dev'
alias klogs='kubectl logs -f'
alias kexec='kubectl exec -it'
alias kpf='kubectl port-forward'
alias ktop='kubectl top'
alias kdesc='kubectl describe'

# Quick access
alias loksewa-logs='stern -n loksewa-prod'
alias loksewa-top='kubectl top pods -n loksewa-prod --sort-by=memory'
```

---

**Last Updated:** 2026-06-01  
**Version:** 1.0  
**Maintainer:** RhinoPeak Labs Nepal DevOps Team  
**Contact:** devops@loksewa-ai.com

For updates and the latest version, see: https://github.com/rhinopeaklabs-nepal/Loksewa-Ai-App/blob/main/docs/HOSTING.md
