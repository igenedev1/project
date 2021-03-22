from django import forms
from django.core.exceptions import ValidationError 
from .models import Leave
from django.utils.translation import gettext_lazy as _


class LeaveForm(forms.ModelForm):
    class Meta:
        model=Leave
        fields="__all__"
    
    def clean(self):
        super().clean()
        date=self.cleaned_data["date"]
        type=self.cleaned_data["leave_type"]
        name=self.cleaned_data["name"]
        print("dict:%s"%(self.errors))

        if type=="I_GENE_HLDAY":
            if name==None:
                # print("dict:%s"%(self.errors))
                # if self.errors["date"] is not None:
                #     self._errors['date'].append('A Name is required for Igene Holiday')
                # else:
                raise ValidationError({"name":ValidationError(_("A Name is required for Igene Holiday"), code='invalid')})
                # self.add_error("date","A Name is required for Igene Holiday")
            if Leave.objects.filter(date=date,leave_type="WEEKEND").exists():
                raise ValidationError(_("A Weekend Holiday has already been alloted.Please Try some other day..!!"), code='invalid')
        else:
            if Leave.objects.filter(date=date,leave_type="I_GENE_HLDAY").exists():
                raise ValidationError(_("An IGene Holiday has already been alloted.Please Try some other day..!!"), code='invalid')



class TestLeaveForm(forms.ModelForm):
    class Meta:
        model=Leave
        fields="__all__"

    def clean(self):
        cleaned_data = super().clean()
        date = cleaned_data.get("date")
        type = cleaned_data.get("leave_type")    
        # raise ValidationError({"name":[ValidationError(_("njdfkdkf dfnhjdfd dfdf"), code='required'),ValidationError(_("n dfnhjdfd dfdf"), code='invalid')]}) 
        # raise ValidationError([ValidationError(_("njdfkdkf dfnhjdfd dfdf"), code='required'),ValidationError(_("n dfnhjdfd dfdf"), code='invalid')])
        # raise ValidationError(ValidationError(_("njdfkdkf dfnhjdfd dfdf"), code='required')) 
        # raise ValidationError(ValidationError(_("njdfkdkf dfnhjdfd dfdf"), code='required'),ValidationError(_("n dfnhjdfd dfdf"), code='invalid'))    
        raise ValidationError(_("njdfkdkf dfnhjdfd dfdf"), code='required')    