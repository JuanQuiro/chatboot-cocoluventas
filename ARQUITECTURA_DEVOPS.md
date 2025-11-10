# 🚀 DEVOPS & CI/CD SENIOR

## Pipeline Completo de Clase Mundial

---

## 📋 FLUJO COMPLETO

```
Developer → Git Push → GitHub Actions → Build → Test → Security → 
→ Docker Build → Push Registry → Deploy K8s → Health Check → 
→ Monitoring → Alerts
```

---

## 🔄 GITHUB ACTIONS PIPELINE

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # ========================================
  # JOB 1: CODE QUALITY
  # ========================================
  code-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Format check
        run: npm run format:check
      
      - name: Type check
        run: npm run type-check

  # ========================================
  # JOB 2: UNIT TESTS
  # ========================================
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests

  # ========================================
  # JOB 3: INTEGRATION TESTS
  # ========================================
  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      mongodb:
        image: mongo:7
        options: >-
          --health-cmd "mongosh --eval 'db.runCommand({ping: 1})'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test
          MONGODB_URL: mongodb://localhost:27017/test
          REDIS_URL: redis://localhost:6379

  # ========================================
  # JOB 4: SECURITY SCAN
  # ========================================
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Snyk Security Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  # ========================================
  # JOB 5: BUILD DOCKER IMAGES
  # ========================================
  build:
    needs: [code-quality, unit-tests, integration-tests, security-scan]
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    strategy:
      matrix:
        service:
          - chatbot
          - sellers
          - analytics
          - orders
          - products
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/${{ matrix.service }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./services/${{ matrix.service }}
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # ========================================
  # JOB 6: DEPLOY TO STAGING
  # ========================================
  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment:
      name: staging
      url: https://staging.emberdrago.com
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure kubectl
        uses: azure/k8s-set-context@v3
        with:
          method: kubeconfig
          kubeconfig: ${{ secrets.KUBE_CONFIG_STAGING }}
      
      - name: Deploy with Helm
        run: |
          helm upgrade --install \
            chatbot-staging ./helm/chatbot \
            --namespace staging \
            --create-namespace \
            --values ./helm/values-staging.yaml \
            --set image.tag=${{ github.sha }}
      
      - name: Wait for rollout
        run: |
          kubectl rollout status deployment/chatbot \
            -n staging \
            --timeout=5m

  # ========================================
  # JOB 7: E2E TESTS (STAGING)
  # ========================================
  e2e-tests:
    needs: deploy-staging
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          BASE_URL: https://staging.emberdrago.com
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  # ========================================
  # JOB 8: DEPLOY TO PRODUCTION
  # ========================================
  deploy-production:
    needs: e2e-tests
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://emberdrago.com
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure kubectl
        uses: azure/k8s-set-context@v3
        with:
          method: kubeconfig
          kubeconfig: ${{ secrets.KUBE_CONFIG_PRODUCTION }}
      
      - name: Deploy with Helm (Blue-Green)
        run: |
          # Deploy to green
          helm upgrade --install \
            chatbot-green ./helm/chatbot \
            --namespace production \
            --values ./helm/values-production.yaml \
            --set image.tag=${{ github.sha }} \
            --set color=green
          
          # Wait for green
          kubectl rollout status deployment/chatbot-green \
            -n production \
            --timeout=5m
          
          # Smoke tests
          ./scripts/smoke-tests.sh green
          
          # Switch traffic to green
          kubectl patch service chatbot \
            -n production \
            -p '{"spec":{"selector":{"color":"green"}}}'
          
          # Delete blue
          helm delete chatbot-blue -n production || true
      
      - name: Slack notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Deployed to production: ${{ github.sha }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 🐳 DOCKERFILE OPTIMIZADO

```dockerfile
# services/chatbot/Dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY src ./src

# Build
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Stage 2: Production
FROM node:20-alpine

# Security: Non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Switch to non-root
USER nodejs

# Expose port
EXPOSE 3000

# Start
CMD ["node", "dist/main.js"]
```

---

## ☸️ KUBERNETES MANIFESTS

### Deployment
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: chatbot
  namespace: production
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: chatbot
  template:
    metadata:
      labels:
        app: chatbot
        version: v1
    spec:
      serviceAccountName: chatbot
      
      # Security Context
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      
      # Init Container (migrations)
      initContainers:
        - name: migrations
          image: ghcr.io/emberdrago/chatbot-migrations:latest
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: chatbot-secrets
                  key: database-url
      
      containers:
        - name: chatbot
          image: ghcr.io/emberdrago/chatbot:latest
          imagePullPolicy: Always
          
          ports:
            - containerPort: 3000
              name: http
              protocol: TCP
          
          # Environment
          env:
            - name: NODE_ENV
              value: production
            - name: PORT
              value: "3000"
          
          envFrom:
            - configMapRef:
                name: chatbot-config
            - secretRef:
                name: chatbot-secrets
          
          # Resources
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi
          
          # Probes
          livenessProbe:
            httpGet:
              path: /health
              port: http
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          
          readinessProbe:
            httpGet:
              path: /ready
              port: http
            initialDelaySeconds: 10
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3
          
          # Security
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL
          
          # Volume Mounts
          volumeMounts:
            - name: tmp
              mountPath: /tmp
            - name: cache
              mountPath: /app/.cache
      
      volumes:
        - name: tmp
          emptyDir: {}
        - name: cache
          emptyDir: {}
```

### HPA (Horizontal Pod Autoscaler)
```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: chatbot
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: chatbot
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
      stabilizationWindowSeconds: 0
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
        - type: Pods
          value: 4
          periodSeconds: 15
      selectPolicy: Max
```

Ver ARQUITECTURA_MONITOREO.md para observabilidad completa.
