#!/bin/bash
# ===============================================
# Database Test Runner
# Usage: ./db-test.sh [test_number|all]
# ===============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR/../.."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Load environment variables from root .env if it exists
if [ -f "$ROOT_DIR/.env" ]; then
    set -a
    source "$ROOT_DIR/.env"
    set +a
fi

# Database connection settings (with defaults)
POSTGRES_USER=${POSTGRES_USER:-abdelmounaim}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-library_pass}
POSTGRES_DB=${POSTGRES_DB:-library_db}
POSTGRES_HOST=${POSTGRES_HOST:-localhost}
POSTGRES_PORT=${POSTGRES_PORT:-5432}
POSTGRES_CONTAINER_NAME=${POSTGRES_CONTAINER_NAME:-library-platform-db}

# Check if Docker container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${POSTGRES_CONTAINER_NAME}$"; then
    echo -e "${RED}Error: Docker container '${POSTGRES_CONTAINER_NAME}' is not running.${NC}"
    echo ""
    echo "Start it with:"
    echo "  $SCRIPT_DIR/db-start.sh"
    exit 1
fi

# Function to run a single test file
run_single_test() {
    local test_file=$1
    local test_name=$2
    
    echo "========================================="
    echo "Running: $test_name"
    echo "========================================="
    echo ""
    
    if docker exec "$POSTGRES_CONTAINER_NAME" bash -c "PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -v ON_ERROR_STOP=1 -f /tests/$test_file"; then
        echo ""
        echo -e "${GREEN}✓ $test_name PASSED${NC}"
        return 0
    else
        echo ""
        echo -e "${RED}✗ $test_name FAILED${NC}"
        return 1
    fi
}

# Function to run all tests
run_all_tests() {
    echo "========================================="
    echo "Library Platform Database Test Suite"
    echo "========================================="
    echo ""
    echo "Database: $POSTGRES_DB"
    echo "User: $POSTGRES_USER"
    echo "Host: $POSTGRES_HOST:$POSTGRES_PORT"
    echo ""
    
    # Check if database is accessible
    if ! docker exec "$POSTGRES_CONTAINER_NAME" bash -c "PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB -c 'SELECT 1'" > /dev/null 2>&1; then
        echo -e "${RED}ERROR: Cannot connect to database${NC}"
        echo "Please ensure the database is running and accessible"
        exit 1
    fi
    
    echo -e "${GREEN}Database connection successful${NC}"
    echo ""
    
    # Test files
    local tests=(
        "001_test_schema.sql:Schema Tests"
        "002_test_triggers.sql:Trigger Tests"
        "003_test_business_functions.sql:Business Function Tests"
        "004_test_rls.sql:RLS Tests"
    )
    
    local tests_passed=0
    local tests_failed=0
    local failed_tests=()
    
    # Run each test
    for test_info in "${tests[@]}"; do
        IFS=':' read -r test_file test_name <<< "$test_info" || continue
        
        echo "Running: $test_name"
        
        if docker exec "$POSTGRES_CONTAINER_NAME" bash -c "PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -v ON_ERROR_STOP=1 -f /tests/$test_file" > /tmp/test_output.log 2>&1; then
            echo -e "${GREEN}✓ $test_name PASSED${NC}"
            tests_passed=$((tests_passed + 1))
        else
            echo -e "${RED}✗ $test_name FAILED${NC}"
            echo ""
            echo "Error output:"
            cat /tmp/test_output.log
            tests_failed=$((tests_failed + 1))
            failed_tests+=("$test_file")
        fi
        echo ""
    done
    
    # Summary
    echo "========================================="
    echo "Test Summary"
    echo "========================================="
    echo -e "Total tests: $((tests_passed + tests_failed))"
    echo -e "${GREEN}Passed: $tests_passed${NC}"
    echo -e "${RED}Failed: $tests_failed${NC}"
    
    if [ $tests_failed -gt 0 ]; then
        echo ""
        echo "Failed tests:"
        for test in "${failed_tests[@]}"; do
            echo "  - $test"
        done
        echo ""
        echo -e "${RED}TEST SUITE FAILED${NC}"
        exit 1
    else
        echo ""
        echo -e "${GREEN}ALL TESTS PASSED ✓${NC}"
        echo ""
        echo "Database schema is working correctly!"
        exit 0
    fi
}

# If no argument, show menu
if [ $# -eq 0 ]; then
    echo "========================================="
    echo "Library Platform - Test Runner"
    echo "========================================="
    echo ""
    echo "Available tests:"
    echo "  1) Schema Tests"
    echo "  2) Trigger Tests"
    echo "  3) Business Function Tests"
    echo "  4) RLS Tests"
    echo "  all) Run all tests"
    echo ""
    echo "Usage:"
    echo "  $0 [test_number|all]"
    echo ""
    echo "Examples:"
    echo "  $0 1          # Run schema tests"
    echo "  $0 all        # Run all tests"
    exit 0
fi

# Parse argument
TEST_NUM=$1

# Map test number to file
case $TEST_NUM in
    1)
        run_single_test "001_test_schema.sql" "Schema Tests"
        ;;
    2)
        run_single_test "002_test_triggers.sql" "Trigger Tests"
        ;;
    3)
        run_single_test "003_test_business_functions.sql" "Business Function Tests"
        ;;
    4)
        run_single_test "004_test_rls.sql" "RLS Tests"
        ;;
    all)
        run_all_tests
        ;;
    *)
        echo -e "${RED}Invalid test number: $TEST_NUM${NC}"
        echo ""
        echo "Valid options: 1, 2, 3, 4, all"
        exit 1
        ;;
esac

