from django.shortcuts import render, redirect
from datetime import date
from django.http import HttpResponse, JsonResponse
from .serializers import UserSerializer,UserSelectSerializer
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth import get_user_model
from accounts.forms import UserLoginForm,CustomUserCreationForm,UserCreationForm
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth import logout, login
from django.contrib.auth.decorators import login_required
from .utils import allowed_users
import xlrd
import json
import logging

User = get_user_model()

# Create your views here.
def getdata(request):
    if request.method == "POST":
        print(request)
        return JsonResponse({"result": "success"})

    data = UserSerializer(User.objects.all(), many=True).data

    return JsonResponse(data, safe=False)


def postUser(request):
    if request.method == "POST":
        form=CustomUserCreationForm(request.POST)
        if form.is_valid():
            user=form.save(commit=True)
            print(user.igene_id)
            data = UserSerializer(User.objects.all(), many=True).data                       
            return JsonResponse({"result":data}, safe=False)

        else:
            data = json.loads(form.errors.as_json())
            return JsonResponse({"errors": data}, status=400, safe=False)

    

    return JsonResponse({"result": "success"})


def editUser(request):
    if request.method == "POST":

        json_data = json.loads(str(request.body, encoding="utf-8"))
        userid = json_data["userid"]
        del json_data["userid"]
        User.objects.filter(pk=userid).update(**json_data)
        data = UserSerializer(User.objects.all(), many=True).data
        return JsonResponse(data, safe=False)

    return JsonResponse({"result": "success"})


def getUser(request):
    if request.method == "POST":

        json_data = json.loads(str(request.body, encoding="utf-8"))

        data = UserSerializer(User.objects.get(pk=json_data["userid"])).data
        return JsonResponse(data, safe=False)

    return JsonResponse({"result": "success"})


def deleteUser(request):
    if request.method == "POST":

        json_data = json.loads(str(request.body, encoding="utf-8"))

        User.objects.get(pk=json_data["userid"]).delete()
        data = UserSerializer(User.objects.all(), many=True).data
        return JsonResponse(data, safe=False)

    return JsonResponse({"result": "success"})


@ensure_csrf_cookie
@login_required(login_url="login")
def index(request):
    print(request.user)
    user_type = request.user.usertype
    if user_type == "IT-SUPPORT":
        return render(request, "index.html")
    if user_type == "ARTIST":
        return redirect("artist_dashboard")
    return  redirect("lead_dashboard")

@ensure_csrf_cookie
@allowed_users(allowed_roles=["IT-SUPPORT"])
@login_required(login_url="login")
def getInventory(request):
    print(request.user)
   
    return render(request, "index.html")

 
@ensure_csrf_cookie
@login_required(login_url="login")
def change_password(request):
    if request.method == "POST":
        form=PasswordChangeForm(request.user,data=request.POST)
        if form.is_valid():
            form.save()
            logout(request)
            return redirect("login")
        else:
            return render(request,"password.html",{"form":form})
            
    form=PasswordChangeForm(request.user)
    return render(request,"password.html",{"form":form})



def loginuser(request):
    # logging.getLogger('accounts').debug("here")
    if request.user.is_authenticated:
        return redirect("indexuser")
    next_url=request.GET.get('next',None)
    if request.method == "POST":
        form = UserLoginForm(request=request, data=request.POST)
        print(request.POST)
        next_url=request.POST.get('next',None)
        print(next_url)
        if form.is_valid():
            user = form.get_user()
            print(user.usertype)
            login(request, user)
            print("hereaftervalid")
            if next_url == None:
                return redirect("indexuser")
              # user is redirected to dashboard
            return redirect(next_url)
        else:
            print(form.errors)
    else:
        next_url=request.GET.get('next',None)
        form = UserLoginForm()
    
    if(next_url != None):
        return render(request, "login.html", {"form": form,"next":next_url})

    return render(request, "login.html", {"form": form})


def userlogout(request):
    logout(request)
    return redirect("login")


@login_required(login_url="login")
@allowed_users(allowed_roles=["PRODUCTION"])
def testlogin(request):
    return render(request, "indexproduction.html")

def getUsersSelect(request):
    if request.method == "POST":
        print(request)
        return JsonResponse({"result": "success"})

    data = UserSelectSerializer(User.objects.filter(usertype="ARTIST"), many=True).data

    return JsonResponse(data, safe=False)  

def testUserForm(request):
    if request.method == "POST":
        form=UserCreationForm(request.POST)
        if form.is_valid():
            form.save()    
            return JsonResponse({"result": 'success'}, safe=False)
        else:
            data = json.loads(form.errors.as_json())
            return JsonResponse({"errors": data}, status=400, safe=False)

    form=UserCreationForm()
    return render(request, "test.html", {"form": form})

def testException(request):
    raise TimeoutError()

@ensure_csrf_cookie
@allowed_users(allowed_roles=["IT-SUPPORT"])
@login_required(login_url="login")
def sheetUpload(request):
    if request.method == "POST":
        input_excel = request.FILES["input_excel"]
        book = xlrd.open_workbook(file_contents=input_excel.read())
        print(book._sheet_names)
        sheet=book.sheets()[0]
        headers = sheet.row_values(0)
        for i in range(1, sheet.nrows):
            keyArgs = {}
            row_list = sheet.row_values(i)
            for ind in range(len(row_list)):     
                keyArgs[headers[ind]] = row_list[ind]
                print("%s:%s" % (headers[ind], row_list[ind]))
            keyArgs["email"]="%s@igenemedia.com"%(keyArgs["igene_id"])
            keyArgs["usertype"]="ARTIST"

            user=User(**keyArgs)
            user.set_password("testuser123")
            user.save()
        return HttpResponse("completed")

    return render(request, "upload.html")

          


# <option value="PRODUCTION">production</option>
# <option value="PRO-SUP">project supervisor</option>
# <option value="PRO-TL">project lead</option>
# <option value="PRO-CO">project co-ordinator</option>
# <option value="ARTIST">artist</option>
# <option value="IT-SUPPORT">it-support</option>
