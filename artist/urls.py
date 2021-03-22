from django.urls import path

from . import views

urlpatterns = [
    path("dashboard", views.artistdashboard, name="artist_dashboard"),
    path("leadboard", views.leaddashboard, name="lead_dashboard"),
    path("leadprevboard", views.leadprevdashboard, name="lead_prevdashboard"),
    path("artistdata",views.postdailies,name="artist_data"),
    path("form",views.testArtistForms,name="artist_form"),
    path("approvedailies",views.approveDailyUpdate,name="approve_daily"),
    path("rejectdailies",views.rejectDailyUpdate,name="reject_daily"), 
    path("dailies/<int:id>",views.getDailyUpdate,name="dailies"),
    path("dailiesjson",views.getDailiesReport,name="daily_json"),
    path("prevdailiesjson",views.getPrevDu,name="daily_json"),
    path("prevdailiesreportjson",views.getPrevDailiesReport,name="daily_json"),
    path("dailiesreportjson",views.testDailyJson,name="daily_report_json"),
]
