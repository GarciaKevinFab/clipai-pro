from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.db import connection
import traceback


def health_check(request):
    """Health check endpoint with debug info."""
    data = {'status': 'ok', 'service': 'clipai-pro-backend'}
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        data['database'] = 'connected'

        # Check if tables exist
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
            )
            tables = [row[0] for row in cursor.fetchall()]
        data['tables'] = tables
        data['tables_count'] = len(tables)
    except Exception as e:
        data['database'] = 'error'
        data['db_error'] = str(e)
        data['db_traceback'] = traceback.format_exc()

    return JsonResponse(data)


urlpatterns = [
    path('', health_check, name='health-check'),
    path('api/health/', health_check, name='health'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/videos/', include('apps.videos.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/social/', include('apps.social.urls')),
    path('api/affiliates/', include('apps.affiliates.urls')),
    path('api/catalog/', include('apps.catalog.urls')),
]
