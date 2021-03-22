from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from datetime import date,datetime, timedelta,time as t
from django.utils import timezone
import time
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth.decorators import login_required
from accounts.utils import allowed_users
from django.db.models import F
from leave.models import Leave
from .models import DailyUpdate,Dailies
from .forms import DUForm,DailiesForm
from accounts.models import User
from accounts.utils import allowed_users
from django.http import QueryDict
from accounts.serializers import UserDataSerializers,UserDailiesSerializer
import json
from .serializers import DUSerializer,DUserSerializer
import logging

User = get_user_model()

# Create your views here.
@login_required(login_url='/accounts/login')
@allowed_users(allowed_roles=["ARTIST"])
@ensure_csrf_cookie
def artistdashboard(request):
    prev=request.GET.get('prev',None)
    igene_day_leaves=Leave.objects.filter(leave_type="I_GENE_HLDAY").values_list("date",flat=True)
    weekend_leaves=Leave.objects.filter(leave_type="WEEKEND").values_list("date",flat=True)   
    if(prev == None):
        print(time.tzset())
        print(time.ctime())
        print(time.time())
        print(time.localtime())

        print(datetime.today())
        print(datetime.utcnow())

        print(timezone.now().date())
        year, week, today = date.today().isocalendar()
        datelist = [date.fromisocalendar(year, week, x) for x in range(1, 8)]
    else:
        d = datetime.today() - timedelta(days=7*int(prev))
        year, week, today = d.date().isocalendar()
        print(week)
        datelist = [date.fromisocalendar(year, week, x) for x in range(1, 8)]
    print(request.user)
 
    return render(request, "artistdashboard.html", {"datelist": datelist,"igene_day_leaves":igene_day_leaves,"weekend_leaves":weekend_leaves})

@login_required(login_url='/accounts/login')
@allowed_users(allowed_roles=['PRO-CO','PRO-TL','PRO-SUP','IT-SUPPORT'])
@ensure_csrf_cookie
def leaddashboard(request):
    return render(request, "leadreview.html")

@login_required(login_url='/accounts/login')
@allowed_users(allowed_roles=['PRO-CO','PRO-TL','PRO-SUP','IT-SUPPORT'])
@ensure_csrf_cookie
def leadprevdashboard(request):
    return render(request, "leadprev_review.html")

def testArtistForms(request):
    if request.method=="POST":
        form=DailiesForm(request.POST)
        if form.is_valid():
            dal=form.save(commit=False)
            print(dal.slottime.total_seconds())
            return HttpResponse("<h2><b>SUCCEss</b></h2>")
        else:
            return render(request,"test.html",{"form":form})
    else:
        form=DailiesForm()
        return render(request,"test.html",{"form":form})

    

def postdailies(request):
    from datetime import date

    user=request.user
    if request.method == "POST":
        # query_dict_copy=request.POST.copy()
        # print(request.POST.get('date'))
        # print(query_dict_copy.dict().keys())
        # date=query_dict_copy.__getitem__("date")
        json_data = json.loads(str(request.body, encoding="utf-8"))
        logging.getLogger('accounts').debug(" -M- %s -D- ~^~ %s",request.user,json_data)

        dailies_data=[]
        date = json_data["date"]
        if 'dailies' in json_data:
            dailies_data=json_data["dailies"]
            del json_data["dailies"]
        if 'intime' not in json_data:
            json_data['intime']=None
            json_data['outtime']=None
        # if query_dict_copy.__contains__('dailies'):
        #     dailies_data=query_dict_copy.pop("dailies")
            
        # if not query_dict_copy.__contains__('intime'):
        #     query_dict_copy.update({'intime':None,'outtime':None})

        du=None
        if 'outtime' in json_data and json_data['outtime'] is not None:
            if t.fromisoformat(json_data['intime'])>t.fromisoformat(json_data['outtime']):
                return JsonResponse({"errors":{"outtime":[{"message":"Your outtime %s for the following day %s is lesser than in-time %s.Please enter proper entry timings "%(json_data['outtime'],date,json_data['intime']),"code": "invalid"}]}}, status=400, safe=False) 
        
        if DailyUpdate.objects.filter(date=date,updating_user=user).exists():
            print('exists')
            del json_data["date"]
            DailyUpdate.objects.filter(date=date,updating_user=user).update(**json_data)
            # query_dict_copy.pop('date')
            # DailyUpdate.objects.filter(date=date,updating_user=user).update(**query_dict_copy.dict())
            du=DailyUpdate.objects.filter(date=date,updating_user=user)[0]
            if(du.approved):
                return JsonResponse({"errors":{"Approved":[{"message":"Your daily Update for the following day %s has been approved.Please contact admin."%(date),"code": "invalid"}]}}, status=400, safe=False) 
            du.total_hours=None
            du.save()
            Dailies.objects.filter(update=du).delete()
        else:
            print('exists else')
            du=DailyUpdate.objects.create(**json_data,updating_user=user)
            # query_dict_copy.__setitem__('updating_user', user)
            # du_form=DUForm(query_dict_copy)
            # du=du_form.save()
        for dailies in dailies_data:     
            query_dict_dailie = QueryDict('', mutable=True)
            dailies["update"]=du
            query_dict_dailie.update(dailies)
            form =DailiesForm(query_dict_dailie)
            if form.is_valid():
                curr_dail=form.save()
                if not(curr_dail.slottype=="LEAVE" or curr_dail.slottype=="H_LEAVE"):
                    if du.total_hours==None: 
                        du.total_hours = curr_dail.slottime 
                    else:
                        du.total_hours += curr_dail.slottime                                    
            else:
                du.save()
                return JsonResponse({"errors": form.errors.get_json_data()}, status=400, safe=False)
        du.save()
        print(datetime.now().time())
        return JsonResponse({"result": "success"}, safe=False) 
    else:
        prev=request.GET.get('prev',None)    
        if(prev == None):
            year, week, today = date.today().isocalendar()
            datelist = [date.fromisocalendar(year, week, x) for x in range(1, 8)]
        else:
            d = datetime.today() - timedelta(days=7*int(prev))
            year, week, today = d.date().isocalendar()
            print(week)
            datelist = [date.fromisocalendar(year, week, x) for x in range(1, 8)]
        data=DUSerializer(DailyUpdate.objects.filter(date__in=datelist,updating_user=user),many=True).data
        return JsonResponse({"result": data})



def getDailiesReport(request):
    from datetime import date
    from calendar import monthrange

    today=date.today()
    day,monthdays=monthrange(today.year,today.month)
    datelist=[date(today.year,today.month,x) for x in range(1,monthdays+1)]
    data=UserDataSerializers(User.objects.filter(usertype='ARTIST'),many=True,context={'datelist': datelist}).data
    return JsonResponse({"result": data})

def getPrevDu(request):
    from datetime import date
    from calendar import monthrange

    today=date.today()
    day,monthdays=monthrange(today.year,today.month-1)
    datelist=[date(today.year,today.month-1,x) for x in range(1,monthdays+1)]
    data=UserDataSerializers(User.objects.filter(usertype='ARTIST'),many=True,context={'datelist': datelist}).data
    return JsonResponse({"result": data})


def getPrevDailiesReport(request):
    from datetime import date
    from calendar import monthrange

    today=date.today()
    day,monthdays=monthrange(today.year,today.month-1)
    datelist=[date(today.year,today.month-1,x) for x in range(1,monthdays)]
    data=UserDailiesSerializer(User.objects.filter(usertype='ARTIST'),many=True,context={'datelist': datelist}).data
    return JsonResponse({"result": data})

def testDailyJson(request):
    from datetime import date
    from calendar import monthrange    
    today=date.today()
    day,monthdays=monthrange(today.year,today.month)
    datelist=[date(today.year,today.month,x) for x in range(1,monthdays)]
    data=UserDailiesSerializer(User.objects.filter(usertype='ARTIST'),many=True,context={'datelist': datelist}).data
    return JsonResponse({"result": data})

def getDailyUpdate(request,id):
    if request.method == "POST":
        json_data = json.loads(str(request.body, encoding="utf-8"))
        du_id=json_data["id"]
        del json_data["id"]
        DailyUpdate.objects.filter(pk=du_id).update(**json_data)
        data=DUserSerializer(DailyUpdate.objects.filter(id=du_id)[0]).data
        return JsonResponse({"result": data})

    data=DUserSerializer(DailyUpdate.objects.filter(id=id)[0]).data
    return JsonResponse({"result": data})

def approveDailyUpdate(request):
    if request.method == "POST":
        json_data = json.loads(str(request.body, encoding="utf-8"))
        du_id=json_data["id"]
        del json_data["id"]
        DailyUpdate.objects.filter(pk=du_id).update(approved=True,**json_data)
        print(DailyUpdate.objects.filter(id=du_id)[0])
        data=DUSerializer(DailyUpdate.objects.filter(id=du_id)[0]).data
        return JsonResponse({"result": data})

    return JsonResponse({"result": "success"}) 

def rejectDailyUpdate(request):
    if request.method == "POST":
        json_data = json.loads(str(request.body, encoding="utf-8"))
        du_id=json_data["id"]
        del json_data["id"]
        DailyUpdate.objects.filter(pk=du_id).update(approved=False,**json_data)
        data=DUSerializer(DailyUpdate.objects.filter(id=du_id)[0]).data
        return JsonResponse({"result": data})

    return JsonResponse({"result": "success"}) 


