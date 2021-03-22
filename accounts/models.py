from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

# Create your models here.




class UserManager(BaseUserManager):
    def create_user(
        self,
        email,
        username,
        igene_id,
        usertype="PRODUCTION",
        password=None,
        is_active=True,
        is_staff=False,
        is_admin=False,
    ):
        if not email:
            raise ValueError("Users must have an email address")
        if not username:
            raise ValueError("Users must have an username")
        if not password:
            raise ValueError("Users must have a password")
        user_obj = self.model(
            email=self.normalize_email(email), username=username, igene_id=igene_id
        )
        user_obj.usertype = usertype
        user_obj.set_password(password)  # change user password
        user_obj.staff = is_staff
        user_obj.admin = is_admin
        user_obj.is_active = is_active
        user_obj.save(using=self._db)
        return user_obj

    def create_staffuser(self, email, username, igene_id=None, password=None):
        user = self.create_user(
            email, username, igene_id=igene_id, password=password, is_staff=True
        )
        return user

    def create_superuser(self, email, username, igene_id=None, password=None):
        user = self.create_user(
            email,
            username,
            igene_id=igene_id,
            password=password,
            is_staff=True,
            is_admin=True,
        )
        return user

class User(AbstractBaseUser):
    roles=[('ARTIST', 'artist'), ('PRODUCTION', 'production'), ('PRO-CO', 'project co-ordinator'), ('PRO-TL', 'project lead'), ('PRO-SUP', 'project supervisor'), ('IT-SUPPORT', 'it-support')]
    departments=[("PAINT", "Paint & Prep"),("MATCH", "Match-move"),("ROTO", "Roto"),("COMP", "Comp"),("MANG","Management")]

    usertype =models.CharField(choices=roles,max_length=50)
    email = models.EmailField(max_length=255, unique=True)
    username = models.CharField(max_length=255)
    dept = models.CharField(max_length=255, choices=departments,default="MANG")
    designation = models.CharField(max_length=255, null=True)
    doj = models.DateField(null=True)
    igene_id = models.CharField(max_length=255, unique=True)
    is_active = models.BooleanField(default=True)  # can login
    staff = models.BooleanField(default=False)  # staff user non superuser
    admin = models.BooleanField(default=False)  # superuser
    timestamp = models.DateTimeField(auto_now_add=True)
 

    USERNAME_FIELD = "igene_id"  
    # USERNAME_FIELD and password are required by default
    REQUIRED_FIELDS = ["email","username",] 

    objects = UserManager()

    def __str__(self):
        return f"email:'{self.email}', user:'{self.username}',igene id:'{self.igene_id}'"



    def get_short_name(self):
        return f"User('{self.username}')"

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    @property
    def is_staff(self):
        if self.is_admin:
            return True
        return self.staff

    @property
    def is_admin(self):
        return self.admin