#!/bin/sh
set -e

echo "Waiting for database migrations to succeed..."
until python -m alembic upgrade head; do
	echo "Database not ready for migrations yet. Retrying in 2 seconds..."
	sleep 2
done

echo "Database initialization complete."

if [ "$#" -gt 0 ]; then
	echo "Starting application: $*"
	exec "$@"
fi
