"""
Health Check API, consisting of routes that are used exclusively to
monitor health of the application.
"""

from .routes import health_check_api

blueprint = health_check_api
