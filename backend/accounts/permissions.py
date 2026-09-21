from rest_framework import permissions
from accounts.models import User

class IsAdminUserRole(permissions.BasePermission):
    """
    Allows access only to Admin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin)

class IsShopOwnerRole(permissions.BasePermission):
    """
    Allows access only to Shop Owner users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_shop_owner)

class IsCustomerRole(permissions.BasePermission):
    """
    Allows access only to Customer users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_customer)

class IsShopOwnerOrAdmin(permissions.BasePermission):
    """
    Allows access to Shop Owners or Admins.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.is_shop_owner or request.user.is_admin))
