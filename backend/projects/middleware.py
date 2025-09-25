from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from .models import Organization


class OrganizationMiddleware(MiddlewareMixin):
    """
    Middleware to handle organization-based tenant isolation.
    
    This middleware reads the X-Organization header from incoming requests,
    looks up the corresponding Organization in the database, and sets
    request.organization for use throughout the request cycle.
    """
    
    def process_request(self, request):
        """
        Process incoming request to extract and set organization context.
        """
        # Get the organization identifier from the header
        org_identifier = request.META.get('HTTP_X_ORGANIZATION')
        
        # Initialize organization as None
        request.organization = None
        
        if org_identifier:
            try:
                # Try to find organization by slug first, then by name
                try:
                    organization = Organization.objects.get(slug=org_identifier)
                except Organization.DoesNotExist:
                    # If not found by slug, try by name
                    organization = Organization.objects.get(name=org_identifier)
                
                # Set the organization on the request
                request.organization = organization
                
            except Organization.DoesNotExist:
                # Return 404 if organization doesn't exist
                return JsonResponse(
                    {
                        'error': 'Organization not found',
                        'message': f'No organization found with identifier: {org_identifier}'
                    },
                    status=404
                )
            except Organization.MultipleObjectsReturned:
                # Handle edge case where multiple organizations have same name
                return JsonResponse(
                    {
                        'error': 'Multiple organizations found',
                        'message': f'Multiple organizations found with identifier: {org_identifier}'
                    },
                    status=400
                )
        
        # Continue processing the request
        return None
    
    def process_response(self, request, response):
        """
        Add organization info to response headers for debugging (optional).
        """
        if hasattr(request, 'organization') and request.organization:
            response['X-Current-Organization'] = request.organization.slug
        
        return response