from django import forms
from .models import Dailies, DailyUpdate
from django.contrib.auth import get_user_model

User = get_user_model()





class Testform2(forms.ModelForm):
    class Meta:
        model = Dailies
        fields = "__all__"

class DailiesForm(forms.ModelForm):
    class Meta:
        model = Dailies
        fields=["slottype","slottime","update","shot","percentage"]

class DUForm(forms.ModelForm):
    class Meta:
        model = DailyUpdate
        fields=["intime","outtime","date","total_hours","updating_user"]

