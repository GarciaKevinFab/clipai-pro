from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/videos/', include('apps.videos.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/social/', include('apps.social.urls')),
    path('api/affiliates/', include('apps.affiliates.urls')),
    path('api/catalog/', include('apps.catalog.urls')),
]
