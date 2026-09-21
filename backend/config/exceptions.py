from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    """
    Custom DRF exception handler to ensure standard JSON structure for errors.
    """
    response = exception_handler(exc, context)

    if response is not None:
        message = "An error occurred"
        if isinstance(response.data, dict):
            if 'detail' in response.data:
                message = str(response.data['detail'])
                del response.data['detail']
            elif 'message' in response.data:
                message = str(response.data['message'])
                del response.data['message']

        custom_response_data = {
            'success': False,
            'message': message,
            'errors': response.data if response.data else str(exc)
        }
        response.data = custom_response_data
    else:
        # Unexpected 500 server error
        custom_response_data = {
            'success': False,
            'message': 'Internal server error',
            'errors': str(exc)
        }
        return Response(custom_response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response
