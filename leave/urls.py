from django.urls import path

from . import views

urlpatterns = [
    path("leaveboard",views.leaveDashboard,name="leave_board"),
    path("leavetest",views.testLeaves,name="leave_test"),
    path("update",views.applyLeaves,name="leave_update"),    
    path("undo",views.undoLeaves,name="leaves_undo")
]