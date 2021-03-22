from rest_framework import serializers
from .models import DailyUpdate,Dailies
from django.contrib.auth import get_user_model
from datetime import datetime,date


User = get_user_model() 


class DailiesSerializer(serializers.ModelSerializer):
    class Meta:
        model=Dailies
        fields="__all__"

class DailiesJsonSerializer(serializers.ModelSerializer):
    class Meta:
        model=Dailies
        fields=["slottype","slottime","shot","percentage"]
    
    def to_representation(self, instance):
        if (instance.slottype =="PROD_SHOT" or instance.slottype =="TEST_SHOT"):
            return f'{instance.shot}, {instance.percentage}%, {instance.slottime}.\n'

        return "%s, %s.\n"%(instance.slottype,instance.slottime)

class UNField(serializers.Field):
    def to_representation(self,value):
        user=value.updating_user
        return "%s ( %s )"%(user.username,user.dept)

class Attendance(serializers.Field):
    def to_representation(self,instance):
        return str(datetime.combine(date.today(),instance.outtime)-datetime.combine(date.today(),instance.intime)) if((instance.outtime is not None) and (instance.outtime>instance.intime)) else str(instance.total_hours)

class DUserSerializer(serializers.ModelSerializer):
    username=UNField(source="*")
    attendance=Attendance(source="*")
    dailies=DailiesSerializer(many=True,read_only=True)
    class Meta:
        model=DailyUpdate
        fields=["id","intime","outtime","date","approved","total_hours","review_notes","dailies","artist_notes","username","attendance"]    


class DUSerializer(serializers.ModelSerializer):
    dailies=DailiesSerializer(many=True,read_only=True)
    class Meta:
        model=DailyUpdate
        fields=["id","intime","outtime","date","approved","total_hours","review_notes","dailies","artist_notes"]

class DateDUSerializer(serializers.ModelSerializer):
    class Meta:
        model=DailyUpdate
        fields=["id","intime","outtime","date","total_hours","review_notes","approved"]

    def to_representation(self,instance):
        print(instance.total_hours.__class__)
        return {instance.date.isoformat():{"id":instance.id,"intime":instance.intime,"outtime":instance.outtime,"total_hours":str(datetime.combine(date.today(),instance.outtime)-datetime.combine(date.today(),instance.intime)) if((instance.outtime is not None) and (instance.outtime>instance.intime)) else str(instance.total_hours),"review_notes":instance.review_notes,"approved":instance.approved}}
    
class DailiesField(serializers.Field):
    def to_representation(self, value):
        dailies_list = DailiesJsonSerializer(value.dailies.all())      
        return "".join(dailies_list)



class DUJsonSerializer(serializers.ModelSerializer):
    
    class Meta:
        model=DailyUpdate
        fields=["id","intime","outtime","date","total_hours","review_notes","approved"]

    def to_representation(self,instance):
        print(instance.id)
        dailies_list = DailiesJsonSerializer(Dailies.objects.filter(update__id=instance.id),many=True).data      
        dailies_all= "".join(dailies_list)
        print(dailies_all)        
        return {instance.date.isoformat():{"attend":"%s-%s"% ("P",str(instance.total_hours)[:-3]) if (instance.total_hours!=None) else "%s-%s"% ("A",""),"work":dailies_all}}