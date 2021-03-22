from datetime import datetime
from django.db import models
from datetime import date as dt
# Create your models here.
class Leave(models.Model):
    types=(
        ("I_GENE_HLDAY","Igene-Holiday"),
        ("WEEKEND","Weekend")
    )
    leave_type=models.CharField(max_length=64,choices=types)
    date=models.DateField(unique=True)
    name=models.CharField(max_length=100,null=True,blank=True)
    # year=models.CharField(max_length=10,default=dt.today().year,blank=True)
    # class Meta:
    #     constraints = [
    #         models.UniqueConstraint(
    #             fields=["date", "year"], name="unique_holiday_date_for_year"
    #         )
    #     ]
