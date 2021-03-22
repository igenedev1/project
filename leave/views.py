from datetime import date, timedelta
from re import L
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from accounts.utils import allowed_users
from .forms import LeaveForm,TestLeaveForm
from .models import Leave
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
import calendar
import json

# Create your views here.
def applyLeaves(request):
    if request.method=="POST":
        form=LeaveForm(request.POST)     
        if form.is_valid():
            form.save()
            return JsonResponse({"success":True})
        else:
            return JsonResponse({"errors": form.errors.get_json_data()}, status=400, safe=False)
    else:
        return JsonResponse({"success":True})


def testLeaves(request):
    if request.method=="POST":
        form=TestLeaveForm(request.POST)
        if form.is_valid():
            form.save()
            return JsonResponse({"success":True})
        else:
            return JsonResponse({"errors": form.errors.get_json_data()}, status=400, safe=False)
    else:
        form=TestLeaveForm(request.GET)
        return JsonResponse({"errors": form.errors.get_json_data()}, status=400, safe=False)
        
def undoLeaves(request):
    if request.method=="POST":
        json_data = json.loads(str(request.body, encoding="utf-8"))
        try:
            Leave.objects.get(date=json_data["date"]).delete()
        except(Leave.DoesNotExist):  
            return JsonResponse({"errors":{"date":[{"message":"Holiday for Day does not Exist","code": "invalid"}]}}, status=400, safe=False)      
        return JsonResponse({"result":"success"})
    else:
        return JsonResponse({"success":True})

def getYearDays(request):
    days_dict={}
    for i in range(1,13):
        monthdays_list=[]
        year=date.today().year
        startyear,start_week,day=date(year,i,1).isocalendar()
        end_week=date(year,i,calendar.monthrange(year,i)[1]).isocalendar()[1]
        if i==1 and (year!=startyear):         
            monthdays_list.append([ date.fromisocalendar(startyear, start_week, weekday) if date.fromisocalendar(startyear, start_week, weekday).month==i else None for weekday in range(1,8)])                
       
        for week in range(1,end_week+1) if i==1 else range(start_week,end_week+1):
            weekday_list=[ date.fromisocalendar(year, week, weekday) if date.fromisocalendar(year, week, weekday).month==i else None for weekday in range(1,8)]
            monthdays_list.append(weekday_list)
        days_dict[i]=monthdays_list
    print(days_dict)
    return JsonResponse({"result":days_dict}) 

@login_required(login_url='/accounts/login')
@allowed_users(allowed_roles=["PRODUCTION","IT-SUPPORT"])
@ensure_csrf_cookie
def leaveDashboard(request):
    months=["January","February","March","April","May","June","July","August","September","October","November","December"]
    days_dict={}
    igene_day_leaves=Leave.objects.filter(leave_type="I_GENE_HLDAY").values_list("date",flat=True)
    igene_holidays=Leave.objects.filter(leave_type="I_GENE_HLDAY")
    weekend_leaves=Leave.objects.filter(leave_type="WEEKEND").values_list("date",flat=True)
    year=date.today().year
    sunday_count=0
    dt = date(year, 1, 1)
    dt += timedelta(days = 6 - dt.weekday())  
    while dt.year == year:
        if dt not in igene_day_leaves and dt not in weekend_leaves:
            sunday_count += 1
        
        dt += timedelta(days = 7)
    total_days= 366- sunday_count if calendar.isleap(year) else 365-sunday_count
    for i in range(1,13):
        monthdays_list=[]
        startyear,start_week,day=date(year,i,1).isocalendar()
        end_week=date(year,i,calendar.monthrange(year,i)[1]).isocalendar()[1]
        if i==1 and (year!=startyear):         
            monthdays_list.append([ date.fromisocalendar(startyear, start_week, weekday) if date.fromisocalendar(startyear, start_week, weekday).month==i else None for weekday in range(1,8)])                
       
        for week in range(1,end_week+1) if i==1 else range(start_week,end_week+1):
            weekday_list=[ date.fromisocalendar(year, week, weekday) if date.fromisocalendar(year, week, weekday).month==i else None for weekday in range(1,8)]
            monthdays_list.append(weekday_list)
        days_dict[i]=monthdays_list

    return render(request,"dashboard.html",{"months":months,"month_days":days_dict,"range":range(1,13),"igene_day_leaves":igene_day_leaves,"igene_holidays":igene_holidays,"weekend_leaves":weekend_leaves,"total_days":total_days-len(igene_day_leaves)-len(weekend_leaves)}) 
    

