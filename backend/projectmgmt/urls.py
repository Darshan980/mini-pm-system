"""
URL configuration for projectmgmt project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# Add this to your main urls.py (projectmgmt/urls.py)
from django.contrib import admin
from django.urls import path
from graphene_django.views import GraphQLView
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from datetime import datetime

def health_check(request):
    """Simple health check endpoint for cron jobs"""
    return JsonResponse({
        "status": "ok", 
        "timestamp": datetime.now().isoformat(),
        "service": "mini-pm-system"
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('graphql/', csrf_exempt(GraphQLView.as_view(graphiql=True))),
    path('health/', health_check, name='health_check'),  # Add this line
    path('ping/', health_check, name='ping'),  # Alternative endpoint name
]
