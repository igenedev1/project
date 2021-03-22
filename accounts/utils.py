from django.core.exceptions import PermissionDenied


def allowed_users(allowed_roles=[]):
    def decorator(view_func):
        def wrapper_func(request, *args, **kwargs):

            usertype = request.user.usertype

            if usertype in allowed_roles:
                return view_func(request, *args, **kwargs)
            else:
                # return HttpResponse("You are not authorized to view this page")
                raise PermissionDenied()

        return wrapper_func

    return decorator
