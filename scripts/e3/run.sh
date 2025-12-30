#!/bin/bash
# 🧪 GACP E3 Stress Test Runner
# Apple-Standard Load Testing

set -e

echo "🧪 GACP E3 Stress Test"
echo "======================"
echo ""

# Configuration
TARGET_URL="${TARGET_URL:-http://47.129.167.71}"
MAX_VUS="${MAX_VUS:-100}"
DURATION="${DURATION:-8m}"

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo "⚠️ k6 is not installed. Installing..."
    
    # Detect OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo gpg -k
        sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
        echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
        sudo apt-get update
        sudo apt-get install k6 -y
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install k6
    else
        echo "Please install k6 manually: https://k6.io/docs/get-started/installation/"
        exit 1
    fi
fi

# Pre-flight check
echo "🔍 Pre-flight checks..."
echo "Target: $TARGET_URL"

# Test connectivity
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL/health" || echo "000")
if [ "$HTTP_STATUS" != "200" ]; then
    echo "❌ Target not reachable (HTTP $HTTP_STATUS)"
    exit 1
fi
echo "✅ Target is reachable"

# Create results directory
RESULTS_DIR="./results/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$RESULTS_DIR"

echo ""
echo "🚀 Starting stress test..."
echo "Max VUs: $MAX_VUS"
echo "Duration: $DURATION"
echo "Results: $RESULTS_DIR"
echo ""

# Run k6
k6 run \
    --env BASE_URL="$TARGET_URL" \
    --out json="$RESULTS_DIR/metrics.json" \
    ./stress-test.js \
    2>&1 | tee "$RESULTS_DIR/output.log"

echo ""
echo "📊 Test complete!"
echo "Results saved to: $RESULTS_DIR"

# Quick summary
if [ -f "$RESULTS_DIR/stress-test-results.json" ]; then
    echo ""
    echo "Summary:"
    cat "$RESULTS_DIR/stress-test-results.json"
fi
