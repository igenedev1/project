from django.db import models
from rest_framework import serializers

from django.contrib.auth import get_user_model
from artist.models import DailyUpdate
from artist.serializers import DateDUSerializer,DUJsonSerializer


User = get_user_model()

roles = dict(
    [
        ("ARTIST", "artist"),
        ("PRODUCTION", "production"),
        ("PRO-CO", "project co-ordinator"),
        ("PRO-TL", "project lead"),
        ("PRO-SUP", "project supervisor"),
        ("IT-SUPPORT", "it-support"),
    ]
)


class UserTypeField(serializers.Field):
    def to_representation(self, value):
        usertype = value.usertype
        ret = {}

        if value.usertype is not None:
            ret = roles[usertype]

        return ret

    def to_internal_value(self, data):
        ret = {"usertype": data["usertype"]}
        return ret


class UserSerializer(serializers.ModelSerializer):
    usertype = UserTypeField(source="*")

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "dept",
            "designation",
            "doj",
            "igene_id",
            "usertype",
        ]

class UserSelectSerializer(serializers.ModelSerializer):
    

    class Meta:
        model = User
        fields = [
            "id",           
            "username",           
        ]


class UserDataSerializers(serializers.ModelSerializer):
    dates=serializers.SerializerMethodField()

    class Meta:
        model=User
        fields=[
            "username",
            "dept",
            "dates"
        ]
    
    def get_dates(self,obj):
        date_dict={}
        month_dates=self.context.get("datelist")
        updates=DailyUpdate.objects.filter(date__in=month_dates,updating_user__id=obj.id)
        dates_data=DateDUSerializer(updates,many=True).data
        for daily in dates_data:
            temp_key=list(daily.keys())[0]
            date_dict[temp_key]=daily[temp_key]
        
        return date_dict

class UserDailiesSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=["username","dept"]
    
    def to_representation(self,instance):
       
        month_dates=self.context.get("datelist")
        updates=DailyUpdate.objects.filter(date__in=month_dates,updating_user__id=instance.id)
        json_data=DUJsonSerializer(updates,many=True).data
        attendance={}
        dailies_work={}
        for data in json_data:
            for key,values in data.items():
                attendance[key]=values['attend']
                dailies_work[key]=values['work']
                 
        attendance.update(artist_name=instance.username,department=instance.dept)
        dailies_work.update(artist_name=instance.username,department=instance.dept)
        return {'attendance':attendance,'dailies_work':dailies_work}  



