from django.urls import path

from . import views

urlpatterns = [
    path("dashboard", views.index, name="indexuser"),
    path("inventory", views.getInventory, name="accounts_inventory"),
    path("postuser", views.postUser, name="postUser"),
    path("userjson", views.getdata, name="getUsers"),
    path("getuser", views.getUser, name="getUser"),
    path("edituser", views.editUser, name="editUsers"),
    path("deleteuser", views.deleteUser, name="deleteUsers"),
    path("login", views.loginuser, name="login"),
    path("pass", views.change_password, name="change_pass"),
    path("logout", views.userlogout, name="logout"),
    path("upload", views.sheetUpload, name="upload"),
    # path("testlogic", views.testlogin),
    # path("testuser", views.testUserForm),
    path("testexcept",views.testException)
]
