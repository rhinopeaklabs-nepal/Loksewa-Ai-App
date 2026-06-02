#!/bin/bash
# Initialize multiple databases in the postgres container
set -e

# Connect to the default 'postgres' database (always present) to create others
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres <<-EOSQL
    CREATE DATABASE loksewa_auth;
    CREATE DATABASE loksewa_user;
    CREATE DATABASE loksewa_learning;
    CREATE DATABASE loksewa_gamification;
    CREATE DATABASE loksewa_knowledge;
    CREATE DATABASE loksewa_ai_svc;
    CREATE DATABASE loksewa_memory;
    CREATE DATABASE loksewa_exam;
    CREATE DATABASE loksewa_analytics;
EOSQL
