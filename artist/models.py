from django.db import models
from django.conf import settings
from django.core.validators import MaxValueValidator

class DailyUpdate(models.Model):
    intime = models.TimeField(null=True)
    outtime = models.TimeField(null=True)
    date = models.DateField()
    review_notes=models.CharField(max_length=500,null=True)
    artist_notes=models.CharField(max_length=500,null=True)
    approved=models.BooleanField(null=True)
    total_hours=models.DurationField(null=True,blank=True)    
    updating_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="dailyupdate", on_delete=models.CASCADE
    )
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["date", "updating_user"], name="unique_update_for_date"
            )
        ]
    def __str__(self):
        return "Daily Update : %s By %s "% (self.date,self.updating_user.username)


class Dailies(models.Model):
    slotchoices = [
        ("PROD_SHOT", "Production Shot"),
        ("TEST_SHOT", "Test Shot"),
        ("TRAIN", "Training"),
        ("I/O", "I/O Downtime"),        
        ("MEET", "Meeting"),
        ("SYS", "System Failure"),
        ("NET", "Network Issue"),
        ("RENDER", "Rendering Downtime"),
        ("PERM", "Permission"),
        ("LEAVE", "Leave"),
        ("H_LEAVE","Half Leave")
    ]
    slottype = models.CharField(choices=slotchoices, max_length=80)
    slottime = models.DurationField()
    update = models.ForeignKey(
        DailyUpdate, related_name="dailies", on_delete=models.CASCADE
    )
    status_accepted=models.BooleanField(null=True)
    shot=models.CharField(max_length=100,null=True,blank=True)    
    percentage=models.DecimalField(max_digits=5,decimal_places=2,null=True,blank=True,validators=[MaxValueValidator(100.00)])

# class ShotProgress(models.Model):
#     dailies=models.ForeignKey(Dailies,on_delete=models.CASCADE)
#     shot=models.ForeignKey(Shot,on_delete=models.CASCADE)
#     percentage=models.DecimalField(max_digits=4,decimal_places=2)
