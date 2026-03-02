#!/bin/bash
# Redis Setup and Verification Script for Fullfill Backend

set -e

echo "=== Fullfill Backend - Redis Setup ==="
echo ""

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
else
    echo "Unsupported OS: $OSTYPE"
    exit 1
fi

# Check if Redis is installed
echo "Checking Redis installation..."
if command -v redis-cli &> /dev/null; then
    echo "✅ Redis CLI found: $(redis-cli --version)"
else
    echo "❌ Redis not found. Installing..."

    if [[ "$OS" == "macos" ]]; then
        if command -v brew &> /dev/null; then
            echo "Installing Redis via Homebrew..."
            brew install redis
        else
            echo "❌ Homebrew not found. Please install Homebrew first:"
            echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
    elif [[ "$OS" == "linux" ]]; then
        echo "Installing Redis via apt..."
        sudo apt-get update
        sudo apt-get install -y redis-server
    fi
fi

# Check if Redis is running
echo ""
echo "Checking Redis status..."
if redis-cli ping &> /dev/null; then
    echo "✅ Redis is running"
else
    echo "❌ Redis is not running. Starting..."

    if [[ "$OS" == "macos" ]]; then
        brew services start redis
        sleep 2
    elif [[ "$OS" == "linux" ]]; then
        sudo systemctl start redis
        sleep 2
    fi

    # Verify it started
    if redis-cli ping &> /dev/null; then
        echo "✅ Redis started successfully"
    else
        echo "❌ Failed to start Redis. Please check logs:"
        if [[ "$OS" == "macos" ]]; then
            echo "   tail -f /usr/local/var/log/redis.log"
        elif [[ "$OS" == "linux" ]]; then
            echo "   sudo journalctl -u redis -f"
        fi
        exit 1
    fi
fi

# Test Redis connection
echo ""
echo "Testing Redis connection..."
PONG=$(redis-cli ping)
if [[ "$PONG" == "PONG" ]]; then
    echo "✅ Redis connection successful: $PONG"
else
    echo "❌ Redis connection failed"
    exit 1
fi

# Show Redis info
echo ""
echo "Redis Information:"
echo "=================="
redis-cli info server | grep -E "redis_version|redis_mode|os|tcp_port"

# Check memory usage
echo ""
echo "Memory Usage:"
echo "============="
redis-cli info memory | grep -E "used_memory_human|maxmemory"

# Test cache operations
echo ""
echo "Testing cache operations..."
redis-cli set "fullfill:test" "Hello from Fullfill" EX 10 > /dev/null
TEST_VAL=$(redis-cli get "fullfill:test")
if [[ "$TEST_VAL" == "Hello from Fullfill" ]]; then
    echo "✅ Cache write/read successful"
    redis-cli del "fullfill:test" > /dev/null
else
    echo "❌ Cache test failed"
    exit 1
fi

# Show current cache keys
echo ""
echo "Current cache keys:"
echo "==================="
KEY_COUNT=$(redis-cli dbsize)
echo "Total keys: $KEY_COUNT"
if [[ "$KEY_COUNT" -gt 0 ]]; then
    echo ""
    echo "Sample keys (showing first 10):"
    redis-cli keys "fullfill:*" | head -10
fi

# Final summary
echo ""
echo "======================================"
echo "✅ Redis setup complete and verified!"
echo "======================================"
echo ""
echo "Useful commands:"
echo "  - Check status:    redis-cli ping"
echo "  - View keys:       redis-cli keys 'fullfill:*'"
echo "  - Clear cache:     redis-cli flushdb"
echo "  - Monitor:         redis-cli monitor"
echo ""
echo "API endpoints:"
echo "  - Cache stats:     GET  http://localhost:8000/api/v1/cache/stats"
echo "  - Clear cache:     POST http://localhost:8000/api/v1/cache/clear"
echo ""
echo "Ready to start the backend server!"
